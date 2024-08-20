import axios from "axios";
import { config } from "../config";
import { logDebug, logError } from "../utils/consoleLogger";
import type { ApiClientsResponse, DmobClient } from "../types/types";

/**
 * Get the list of verified clients from the API.
 *
 * @returns {Promise<ApiClientsResponse>} ApiClientsResponse - The response from the API.
 */
export const getApiClients = async (): Promise<ApiClientsResponse> => {
  logDebug(`Requesting clients from dmob api`);
  try {
    const response = await axios({
      method: "GET",
      url: `${config.filplusApi}/getVerifiedClients`,
      headers: {
        "x-api-key": config.filplusApiKey,
      },
    });
    return {
      data: response.data.data as DmobClient[],
      error: "",
      success: true,
    };
  } catch (error) {
    const errMessage = `Error accessing Dmob API /getVerifiedClients: ${error.message}`;
    return {
      data: [] as DmobClient[],
      error: errMessage,
      success: false,
    };
  }
};

/**
 * Get the health of the Dmob API.
 *
 * @returns {Promise<boolean>} boolean - The response from the API.
 */
export const getDmobHealth = async (): Promise<boolean> => {
  try {
    await axios({
      method: "GET",
      url: `https://api.datacapstats.io/api/health`,
      headers: {
        "x-api-key": config.filplusApiKey,
      },
    });
    return true;
  } catch (error) {
    const errMessage = `Error accessing Dmob API /getAllowanceAssignedToLdnV3InLast2Weeks: ${error.message}`;
    logError(errMessage);
    return false;
  }
};
