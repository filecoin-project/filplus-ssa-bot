import { getApiClients } from "../services/filplusService";
import {
  getAllocators,
  getApplications,
  postNotifyRefill,
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
import {
  getEvmAddressFromFilecoinAddress,
  makeStaticEthCall,
  getVerifiedClientStatus,
} from "../services/glifService";
import { decodeFunctionResult, encodeFunctionData, parseAbi } from "viem";
import type { Hex } from "viem/types/misc";

const metrics = Metrics.getInstance();

/**
 * Checks all applications for the need of a new datacap allocation.
 *
 * @returns Promise<void>
 */
export const checkApplications = async (): Promise<void> => {
  const {
    data: apiClients,
    error: apiClientsError,
    success: apiClientsSuccess,
  } = await getApiClients();

  if (!apiClientsSuccess) {
    logError(`Get Api Clients Error: ${apiClientsError}`);
  }

  const {
    data: allocators,
    error: allocatorsError,
    success: allocatorSuccess,
  } = await getAllocators();
  if (!allocatorSuccess) {
    logError(`Get Allocators Error: ${allocatorsError}`);
  }

  logDebug(`Found ${allocators.length} repos`);

  await Promise.allSettled(
    allocators.map(async ({ owner, repo }) => {
      const allApplications = await getApplications(owner, repo);
      if (!allApplications.success) {
        logError(`Get Applications Error: ${allApplications.error}`);
        return;
      }

      logDebug(
        `Found ${allApplications.data.length} applications merged in ${owner}/${repo}`,
      );

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
  repo: string,
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
  const usesClientSmartContract =
    application?.["Client Contract Address"] !== undefined &&
    application?.["Client Contract Address"].length > 0;
  let remainingDatacap: string;
  if (usesClientSmartContract) {
    try {
      const clientAllowanceFromContract =
        await getClientAllowanceFormClientContract(
          client?.address,
          application?.["Client Contract Address"] as string,
        );
      if (clientAllowanceFromContract === undefined) {
        logError(
          `Failed to get Client allowance from contract for ${config.logPrefix} ${application.ID} `,
        );
        return;
      }
      remainingDatacap = clientAllowanceFromContract.toString();
    } catch (e) {
      logError(`Geting client allowance from contract failed: ${e.message}`);
      return;
    }
  } else {
    remainingDatacap = client?.allowance ?? "0";
  }

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
      } datacap remaining (DMOB / Client Smart Contract) / datacap allocated: ${(
        margin * 100
      ).toFixed(2)}% - doesn't need more allowance`,
    );
    return;
  }

  if (!usesClientSmartContract) {
    // double check, as remainingDatacap from DMOB is often outdated

    const {
      data: glifRemainingDatacap,
      success,
      error,
    } = await getVerifiedClientStatus(client?.addressId);
    if (!success) {
      logError(error);
      return;
    }

    const glifMargin = computeMargin(
      glifRemainingDatacap,
      lastRequestAllowance["Allocation Amount"],
    );

    if (glifMargin > 0.25) {
      logGeneral(
        `${config.logPrefix} ${
          application.ID
        } datacap remaining (Glif) / datacap allocated: ${(
          glifMargin * 100
        ).toFixed(2)}% - doesn't need more allowance`,
      );
      return;
    }

    logGeneral(
      `${config.logPrefix} ${
        application.ID
      } datacap remaining (Glif) / datacap allocated: ${(
        glifMargin * 100
      ).toFixed(2)}% - Needs more allowance`,
    );
  } else {
    logGeneral(
      `${config.logPrefix} ${
        application.ID
      } datacap remaining (Client Smart Contract) / datacap allocated: ${(
        margin * 100
      ).toFixed(2)}% - Needs more allowance`,
    );
  }

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
 * Get the newest allocation request based on the "Updated At" field.
 *
 * @param {Application} application - The application object.
 * @returns {AllocationRequest | undefined} - The newest allocation request.
 */
export const getLastRequestAllowance = (
  application: Application,
): AllocationRequest | undefined => {
  if (application["Allocation Requests"].length === 0) {
    return undefined;
  }

  return application["Allocation Requests"].reduce(
    (newest: AllocationRequest | undefined, current: AllocationRequest) => {
      if (
        newest === undefined ||
        new Date(current["Updated At"]) > new Date(newest["Updated At"])
      ) {
        return current;
      }
      return newest;
    },
    undefined,
  );
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
      response = await postApplicationTotalDCReached(
        application.ID,
        owner,
        repo,
      );
    } catch (e) {
      logError(`Single Client Topup Error: ${e.message}`);
      return { success: false, error: e.message };
    }
  } else {
    try {
      response = await postNotifyRefill(
        application["Issue Number"],
        owner,
        repo,
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

const getClientAllowanceFormClientContract = async (
  clientAddress: string,
  contractAddress: string,
): Promise<bigint | undefined> => {
  const abi = parseAbi([
    "function allowances(address client) external view returns (uint256)",
  ]);

  const [evmClientAddress, evmContractAddress] = await Promise.all([
    getEvmAddressFromFilecoinAddress(clientAddress),
    getEvmAddressFromFilecoinAddress(contractAddress),
  ]);
  if (evmClientAddress.data === null || evmContractAddress.data === null) {
    return;
  }
  const calldataHex: Hex = encodeFunctionData({
    abi,
    args: [evmClientAddress.data],
  });

  const response = await makeStaticEthCall(
    evmContractAddress.data,
    calldataHex,
  );

  if (response.error.length > 0) {
    return;
  }

  const decodedData = decodeFunctionResult({
    abi,
    data: response.data as `0x${string}`,
  });

  return decodedData;
};
