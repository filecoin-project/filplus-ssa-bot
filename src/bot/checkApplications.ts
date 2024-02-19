import { getApiClients } from "../services/filplusService";
import {
  getAllocators,
  getApplications,
  postApplicationRefill,
  postApplicationTotalDCReached,
} from "../services/backendService";
import Metrics from "../services/awsService";
import { logGeneral, logError, logDebug } from "../utils/consoleLogger";
import {
  type DmobClient,
  type Application,
  type RequestAmount,
  type AllocationRequest,
  type RequestAllowanceReturn,
} from "../types/types";
import { config } from "../config";
import { anyToBytes, calculateAllocationToRequest } from "../utils/utils";
import { log } from "console";

const metrics = Metrics.getInstance();

/**
 * Checks all applications for the need of a new datacap allocation.
 *
 * @returns Promise<void>
 */
export const checkApplications = async (): Promise<void> => {
  const { data: apiClients, error: apiClientsError, success: apiClientsSuccess } = await getApiClients();

  if (!apiClientsSuccess) {
    logError(`Get Api Clients Error: ${apiClientsError}`);
  }

  const {data: allocators, error: allocatorsError, success: allocatorSuccess} = await getAllocators();
  if (!allocatorSuccess) {
    logError(`Get Allocators Error: ${allocatorsError}`);
  }

  logDebug(`Found ${allocators.length} repos`);

  await Promise.allSettled(
    allocators.map(async ({owner, repo}) => {
        const allApplications = await getApplications(owner, repo);
        if (!allApplications.success) {
          logError(`Get Applications Error: ${allApplications.error}`);
          return;
        }
      
        logDebug(`Found ${allApplications.data.length} applications in ${owner}/${repo}`);
      
        metrics.updateMetric("applicationsListed", allApplications.data.length);
      
        await Promise.allSettled(
          allApplications.data.map(async (application: Application) => {
            await (async () => {
              try {
                await checkApplication(application, apiClients, owner, repo);
              } catch (e) {
                logError(`Single Client Topup Errors: ${e.message}`);
                throw e;
              }
            })();
          }),
        );
    }),
  );

};

/**
 * Check if an application needs a new datacap allocation.
 *
 * @param {Application} application - The application object.
 * @param {DmobClient[]} apiClients - The list of API clients.
 * @param {string} owner - The owner of the repo.
 * @param {string} repo - The name of the repo.
 * @returns Promise<void>
 */
export const checkApplication = async (
  application: Application,
  apiClients: DmobClient[],
  owner: string,
  repo: string
): Promise<void> => {
  logGeneral(
    `${config.logPrefix} ${application.ID} Start checking application`,
  );

  if (application["Allocation Requests"].length === 0) {
    logGeneral(
      `${config.logPrefix} ${application.ID} has no datacap allocations - the issue still needs to get the 1st round of datacap`,
    );
    return;
  }

  const client = apiClients.find(
    (item) => item.address === application.Lifecycle["On Chain Address"],
  );

  if (client === undefined) {
    logGeneral(
      `${config.logPrefix} ${application.ID} No client found for address ${application.Lifecycle["On Chain Address"]} - the issue still needs to get the 1st round of datacap`,
    );
    return;
  }

  const remainingDatacap = client?.allowance ?? "0";

  const lastRequestAllowance = getLastRequestAllowance(application);
  if (lastRequestAllowance === undefined) {
    logGeneral(
      `${config.logPrefix} ${application.ID} No active last request allowance found`,
    );
    return;
  }

  const margin = computeMargin(
    remainingDatacap,
    lastRequestAllowance["Allocation Amount"],
  );

  if (margin > 0.25) {
    logGeneral(
      `${config.logPrefix} ${
        application.ID
      } datacap remaining / datacap allocated: ${(margin * 100).toFixed(
        2,
      )}% - doesn't need more allowance`,
    );
    return;
  }

  logGeneral(
    `${config.logPrefix} ${
      application.ID
    } datacap remaining / datacap allocated: ${(margin * 100).toFixed(
      2,
    )}% - Needs more allowance`,
  );
  const amountToRequest = calculateAmountToRequest(application);
  await requestAllowance(application, owner, repo, amountToRequest);

  metrics.incrementMetric("ApplicationsAllocationRequested");
};

/**
 * Calculate the amount to request for an application.
 *
 * @param {Application} application - The application object.
 * @returns {RequestAmount} - The amount to request.
 */
export const calculateAmountToRequest = (
  application: Application,
): RequestAmount => {
  const totalDCGranted = application["Allocation Requests"].reduce(
    (acc, cur) => acc + anyToBytes(cur["Allocation Amount"] ?? "0"),
    0,
  );

  const totaldDcRequestedByClient = anyToBytes(
    application.Datacap["Total Requested Amount"],
  );

  const weeklyDcAllocationBytes = anyToBytes(
    application.Datacap["Weekly Allocation"],
  );

  return calculateAllocationToRequest(
    application["Allocation Requests"].length,
    totalDCGranted,
    totaldDcRequestedByClient,
    weeklyDcAllocationBytes,
    application.ID,
  );
};

/**
 * Get the last request allowance from the application object.
 *
 * @param {Application} application - The application object.
 * @returns {RequestInformation} - The last request allowance.
 */
export const getLastRequestAllowance = (
  application: Application,
): AllocationRequest | undefined => {
  if (application.Lifecycle["Active Request ID"] === null) {
    return undefined;
  }
  const lastAllocation = application["Allocation Requests"].find(
    (allocation: AllocationRequest) =>
      allocation.ID === application.Lifecycle["Active Request ID"],
  );

  if (
    lastAllocation === undefined ||
    lastAllocation.Active ||
    lastAllocation.Signers.length !== 2
  ) {
    return undefined;
  }

  return lastAllocation;
};

/**
 * Compute the margin between the remaining DataCap and the last request allowance.
 *
 * @param {string} remainingDatacap - The remaining DataCap.
 * @param {string} lastRequestAllowance - The allowance of the last request.
 * @returns {number} - The computed margin.
 */
export const computeMargin = (
  remainingDatacap: string,
  lastRequestAllowance: string,
): number => {
  const remaining = parseInt(remainingDatacap) ?? 1;
  const lastRequestAllowanceBytes = anyToBytes(lastRequestAllowance);

  return remaining / lastRequestAllowanceBytes;
};

/**
 * Handle the posting of request comments on a GitHub issue.
 *
 * @param {Application} application - The application object.
 * @param {RequestAmount} amountToRequest - The calculated amount to request.
 * @returns {Promise<RequestAllowanceReturn>} - The response from the backend.
 */
export const requestAllowance = async (
  application: Application,
  owner: string,
  repo: string,
  amountToRequest: RequestAmount,
): Promise<RequestAllowanceReturn> => {
  let response;
  if (amountToRequest.totalDatacapReached) {
    try {
      response = await postApplicationTotalDCReached(application.ID, owner, repo);
    } catch (e) {
      logError(`Single Client Topup Error: ${e.message}`);
      return { success: false, error: e.message };
    }
  } else {
    try {
      response = await postApplicationRefill(
        application.ID,
        owner,
        repo,
        amountToRequest.amount.toString(),
        amountToRequest.amountType,
      );
      logGeneral(
        `${config.logPrefix} ${owner}/${repo} - ${application.ID} Refill request sent for ${amountToRequest.amount} ${amountToRequest.amountType}`,
      );
    } catch (e) {
      logError(`Single Client Topup Error: ${e.message}`);
      return { success: false, error: e.message };
    }
  }
  return { success: response.data as boolean, error: "" };
};
