import axios from "axios";
import { config } from "../config";
import { logDebug } from "../utils/consoleLogger";
import {
  type RequestAllocatorsReturn,
  type RequestApplicationsReturn,
  type RequestApplicationReturn,
  type Application,
  type RequestAllowanceReturn,
} from "../types/types";

/**
 * Gets all the allocators from the backend
 *
 * @returns {Promise<RequestAllocatorsReturn>} The list of allocators
 */
export const getAllocators = async (): Promise<RequestAllocatorsReturn> => {
  logDebug(`Requesting allocators from backend`);
  try {
    const response = await axios({
      method: "GET",
      url: `${config.backendApi}/allocators`,
    });
    return {
      data: response.data,
      error: "",
      success: true,
    };
  } catch (error) {
    const errMessage = `Error accessing Backend API /allocator: ${error.message}`;
    return {
      data: [],
      error: errMessage,
      success: false,
    };
  }
};

/**
 * Gets all the applications from the backend.
 *
 * @returns {Promise<RequestApplicationsReturn>} The list of applications.
 */
export const getApplications = async (
  owner: string,
  repo: string,
): Promise<RequestApplicationsReturn> => {
  logDebug(`Requesting ${owner}/${repo} applications from backend`);
  try {
    const response = await axios({
      method: "GET",
      url: `${config.backendApi}/application/merged`,
      params: {
        owner,
        repo,
      },
    });
    return {
      data: response.data.map((appUnit) => {
        if (Array.isArray(appUnit)) {
          return appUnit[1];
        }
        return appUnit;
      }) as Application[],
      error: "",
      success: true,
    };
  } catch (error) {
    const errMessage = `Error accessing Backend API /application/merged ${owner}/${repo}: ${error.message}`;
    return {
      data: [],
      error: errMessage,
      success: false,
    };
  }
};

/**
 * Gets a single application from the backend.
 *
 * @returns {Promise<RequestApplicationReturn>} The application.
 */
export const getApplication = async (
  appId: string,
  owner: string,
  repo: string,
): Promise<RequestApplicationReturn> => {
  logDebug(`Requesting application ${appId} from backend`);

  try {
    const response = await axios({
      method: "GET",
      url: `${config.backendApi}/application`,
      params: {
        id: appId,
        owner,
        repo,
      },
    });
    const application = response.data as Application;

    return {
      application,
      error: "",
      success: true,
    };
  } catch (error) {
    const errMessage = `Error accessing Backend API /application/${appId}: ${error.message}`;
    return {
      application: null,
      error: errMessage,
      success: false,
    };
  }
};

/**
 * Posts a refill request to the backend sending the application ID, the amount to refill and the amount_type.
 *
 * @param {string} applicationId - The application ID.
 * @param {string} amount - The amount to refill.
 * @returns {Promise<RequestAllowanceReturn>} The response from the backend.
 */
export const postApplicationRefill = async (
  applicationId: string,
  owner: string,
  repo: string,
  amount: string,
  amountType,
): Promise<RequestAllowanceReturn> => {
  try {
    const response = await axios({
      method: "POST",
      url: `${config.backendApi}/application/refill`,
      data: {
        id: applicationId,
        owner,
        repo,
        amount,
        amount_type: amountType,
      },
    });
    return {
      error: "",
      success: response.data as boolean,
    };
  } catch (error) {
    const errMessage = `Error accessing Backend API /application/refill ${owner}/${repo}: ${error.message}`;
    return {
      error: errMessage,
      success: false,
    };
  }
};

/**
 * Posts a Total Datacap Reached request to the backend sending the application ID.
 *
 * @param {string} applicationId - The application ID.
 * @returns {Promise<RequestAllowanceReturn>} The response from the backend.
 */
export const postApplicationTotalDCReached = async (
  applicationId: string,
  owner: string,
  repo: string,
): Promise<RequestAllowanceReturn> => {
  try {
    const response = await axios({
      method: "POST",
      url: `${config.backendApi}/application/totaldcreached`,
      data: {
        id: applicationId,
        owner,
        repo,
      },
    });
    return {
      error: "",
      success: response.data as boolean,
    };
  } catch (error) {
    const errMessage = `Error accessing Backend API /application/totaldcreached: ${error.message}`;
    return {
      error: errMessage,
      success: false,
    };
  }
};

/**
 * Gets the health status of the backend.
 *
 * @returns {Promise<boolean>} The response from the backend.
 */
export const getBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await axios({
      method: "GET",
      url: `${config.backendApi}/health`,
    });
    return response.data === "OK";
  } catch (error) {
    return false;
  }
};
