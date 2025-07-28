import { config } from "../config";
import { logDebug } from "./consoleLogger";
import type { RequestAmount } from "../types/types";
import bytes from "bytes-iec";

/**
 * This function is used to convert string formatted bytes to bytes
 *
 * @param inputDatacap
 * @returns number
 */
export function anyToBytes(inputDatacap: string): number {
  try {
    const parsedBytes = bytes.parse(inputDatacap);
    if (parsedBytes !== null) {
      return parsedBytes;
    } else {
      console.error(`Failed to parse string ${inputDatacap} into bytes`);
      return 0;
    }
  } catch (e) {
    console.error(e);
    return 0;
  }
}
/**
 * This function is used to convert bytes to string formatted bytes iB
 *
 * @param inputBytes
 * @returns string
 */
export function bytesToiB(inputBytes: number): string {
  try {
    const parsedValue = bytes(inputBytes, { mode: "binary" });
    if (parsedValue !== null) {
      return parsedValue;
    } else {
      console.error(`Failed to parse bytes ${inputBytes} into string`);
      return "0GiB";
    }
  } catch (e) {
    console.error(e);
    return "0GiB";
  }
}

/**
 * This function is used to calculate the amount to request for the next allocation
 *
 * @param requestNumber
 * @param totalDcGrantedForClientSoFar
 * @param totaldDcRequestedByClient
 * @param weeklyDcAllocationBytes
 * @param applicationId
 * @returns {
 *   amount: string,
 *   amountType: string,
 *   rule: string,
 *   totalDatacapReached: boolean
 *  }
 */
export const calculateAllocationToRequest = (
  requestNumber: number,
  totalDcGrantedForClientSoFar: number,
  totaldDcRequestedByClient: number,
  weeklyDcAllocationBytes: number,
  applicationId: string,
): RequestAmount => {
  logDebug(
    `${
      config.logPrefix
    } ${applicationId} weekly datacap requested by client: ${bytesToiB(
      weeklyDcAllocationBytes,
    )} ${weeklyDcAllocationBytes}B`,
  );
  logDebug(
    `${
      config.logPrefix
    } ${applicationId} total datacap requested by client: ${bytesToiB(
      totaldDcRequestedByClient,
    )}, ${totaldDcRequestedByClient}B`,
  );

  let nextRequest = 0;
  let rule = "";
  let condition = true;
  switch (requestNumber) {
    case 0: // 1nd req (won't never happen here :) - 50%
      condition =
        weeklyDcAllocationBytes / 2 <= totaldDcRequestedByClient * 0.05;
      nextRequest = condition
        ? weeklyDcAllocationBytes / 2
        : totaldDcRequestedByClient * 0.05;
      rule = condition
        ? `50% of weekly dc amount requested`
        : `5% of total dc amount requested`;
      break;
    case 1: // lesser of 100% of weekly allocation rate or 0.5PiB
      condition = weeklyDcAllocationBytes <= config.HALF_PIB;
      nextRequest = condition ? weeklyDcAllocationBytes : config.HALF_PIB;
      rule = condition
        ? `100% of weekly dc amount requested`
        : `100% weekly > 0.5PiB, requesting 0.5PiB`;
      break;
    case 2: // lesser of 200% of weekly allocation rate or 1PiB
      condition = weeklyDcAllocationBytes * 2 <= config.ONE_PIB;
      nextRequest = condition ? weeklyDcAllocationBytes * 2 : config.ONE_PIB;
      rule = condition
        ? `200% of weekly dc amount requested`
        : `200% weekly > 1PiB, requesting 1PiB`;
      break;
    default: // lesser of 400% of weekly allocation rate or 2PiB
      condition = weeklyDcAllocationBytes * 4 <= config.TWO_PIB;
      nextRequest = condition ? weeklyDcAllocationBytes * 4 : config.TWO_PIB;
      rule = condition
        ? `400% of weekly dc amount requested`
        : `400% weekly > 2PiB, requesting 2PiB`;
      break;
  }

  const sumTotalAmountWithNextRequest = Math.floor(
    nextRequest + totalDcGrantedForClientSoFar,
  );
  logDebug(
    `${
      config.logPrefix
    } ${applicationId} sumTotalAmountWithNextRequest (sum next request + total datacap granted to client so far): ${bytesToiB(
      sumTotalAmountWithNextRequest,
    )}`,
  );

  let retObj: RequestAmount;
  if (sumTotalAmountWithNextRequest > totaldDcRequestedByClient) {
    logDebug(
      `${config.logPrefix} ${applicationId} sumTotalAmountWithNextRequest is higher than total datacap requested by client (${totaldDcRequestedByClient}, requesting the difference of total dc requested - total datacap granted so far)`,
    );
    nextRequest = totaldDcRequestedByClient - totalDcGrantedForClientSoFar;
  }
  if (nextRequest <= 0) {
    logDebug(
      `${config.logPrefix} ${applicationId} - seems that the client reached the total datacap request in this application. This should be checked and closed`,
    );
    retObj = {
      amount: 0,
      amountType: "B",
      rule: "total dc reached",
      totalDatacapReached: true,
    };
    return retObj;
  }

  logDebug(
    `${config.logPrefix} ${applicationId} nextRequest ${bytesToiB(
      nextRequest,
    )}`,
  );
  logDebug(`${config.logPrefix} ${applicationId} allocation rule: ${rule}`);
  const [amount, amountType] = splitString(bytesToiB(Math.floor(nextRequest)));

  retObj = {
    amount,
    amountType,
    rule,
    totalDatacapReached: false,
  };

  return retObj;
};

/**
 *
 * @param {string} input - The string to split
 * @returns {[string, string]} - The splitted string
 */
export const splitString = (input: string): [string, string] => {
  // Regex to match expressions like "100PiB" or "0.5TiB"
  const regex = /^(\d+(\.\d+)?)([A-Za-z]iB)$/;

  const match = input.match(regex);
  if (match !== null) {
    return [match[1], match[3]]; // [Number, Unit]
  }

  return ["0", "B"];
};
