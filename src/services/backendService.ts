import axios from "axios";
import { config } from "../config";
import { logDebug } from "../utils/consoleLogger";
import {
  type RequestApplicationsReturn,
  type RequestApplicationReturn,
  type Application,
  type RequestAllowanceReturn,
} from "../types/types";

/**
 * Gets all the applications from the backend.
 *
 * @returns {Promise<RequestApplicationsReturn>} The list of applications.
 */
export const getApplications = async (): Promise<RequestApplicationsReturn> => {
  logDebug(`Requesting applications from backend`);
  try {
    const response = await axios({
      method: "GET",
      url: `${config.backendApi}/application/merged`,
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
    const errMessage = `Error accessing Backend API /application/merged: ${error.message}`;
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
): Promise<RequestApplicationReturn> => {
  logDebug(`Requesting application ${appId} from backend`);

  try {
    const response = await axios({
      method: "GET",
      url: `${config.backendApi}/application/${appId}`,
    });
    return {
      application:
        response.data.length > 0 ? (response.data[0] as Application) : null,
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
  amount: string,
  amountType,
): Promise<RequestAllowanceReturn> => {
  try {
    const response = await axios({
      method: "POST",
      url: `${config.backendApi}/application/${applicationId}/refill`,
      data: {
        id: applicationId,
        amount,
        amount_type: amountType,
      },
    });
    return {
      error: "",
      success: response.data as boolean,
    };
  } catch (error) {
    const errMessage = `Error accessing Backend API /applications/refill: ${error.message}`;
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
): Promise<RequestAllowanceReturn> => {
  try {
    const response = await axios({
      method: "POST",
      url: `${config.backendApi}/application/${applicationId}/totaldcreached`,
    });
    return {
      error: "",
      success: response.data as boolean,
    };
  } catch (error) {
    const errMessage = `Error accessing Backend API /application/${applicationId}/totaldcreached: ${error.message}`;
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
