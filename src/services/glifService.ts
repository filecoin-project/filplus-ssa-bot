import axios from "axios";
import { config } from "../config";
import { logDebug } from "../utils/consoleLogger";
import { type GetVerifiedClientStatusReturn } from "types";

export const getVerifiedClientStatus = async (
  clientId: string,
): Promise<GetVerifiedClientStatusReturn> => {
  logDebug(`Requesting allocators from backend`);
  try {
    const response = await axios.post(config.glifApi, {
      jsonrpc: "2.0",
      method: "Filecoin.StateVerifiedClientStatus",
      params: [clientId, null],
      id: 0,
    });
    return {
      data: response.data.result,
      error: "",
      success: true,
    };
  } catch (error) {
    const errMessage = `Error accessing Glif API Filecoin.StateVerifiedClientStatus: ${error.message}`;
    return {
      data: "",
      error: errMessage,
      success: false,
    };
  }
};
