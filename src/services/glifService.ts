import type { Address, Hex } from "viem";
import { FilecoinClient } from "../services/filecoinPublicClient";
import { logDebug } from "../utils/consoleLogger";

import type {
  GetVerifiedClientStatusReturn,
  ApiFilecoinAddressToEthAddressResponse,
  ApiEthCallResponse,
} from "types";

const filecoinClient = new FilecoinClient();

export const getEvmAddressFromFilecoinAddress = async (
  address: string,
): Promise<ApiFilecoinAddressToEthAddressResponse> => {
  try {
    const result = await filecoinClient.filecoinAddressToEthAddress(address);

    return {
      data: result ?? null,
      error: "",
      success: true,
    };
  } catch (error: unknown) {
    const errMessage = `Error accessing GLIF API Filecoin.FilecoinAddressToEthAddress: ${
      (error as Error).message
    }`;
    return {
      data: null,
      error: errMessage,
      success: false,
    };
  }
};

export const makeStaticEthCall = async (
  contractAddress: Address,
  callData: Hex,
): Promise<ApiEthCallResponse> => {
  try {
    const result = await filecoinClient.staticCall(
      {
        from: null,
        to: contractAddress,
        data: callData,
      },
      "latest",
    );

    return {
      data: result ?? "",
      error: "",
      success: true,
    };
  } catch (error: unknown) {
    const errMessage = `Error accessing GLIF API Filecoin.EthCall: ${
      (error as Error).message
    }`;
    return {
      data: "",
      error: errMessage,
      success: false,
    };
  }
};

export const getVerifiedClientStatus = async (
  address: string,
): Promise<GetVerifiedClientStatusReturn> => {
  logDebug(`Requesting allocators from backend`);
  try {
    const result = await filecoinClient.verifiedClientStatus(address);

    return {
      data: result ?? "",
      error: "",
      success: true,
    };
  } catch (error: unknown) {
    const errMessage = `Error accessing GLIF API Filecoin.StateVerifiedClientStatus: ${
      (error as Error).message
    }`;
    return {
      data: "",
      error: errMessage,
      success: false,
    };
  }
};
