import ByteConverter from "@wtfcode/byte-converter";
import { config } from "../config";
import { logDebug } from "./consoleLogger";
import type {
  RequestAmount,
  ByteConverterAutoscaleOptions,
} from "../types/types";

const byteConverter = new ByteConverter();

/**
 * This function is used to convert string formatted bytes to bytes
 *
 * @param inputDatacap
 * @returns number
 */
export function anyToBytes(inputDatacap: string): number {
  const allowedExtensions = [
    "b",
    "B",
    "kb",
    "kB",
    "Kib",
    "KiB",
    "Mb",
    "MB",
    "Mib",
    "MiB",
    "Gb",
    "GB",
    "Gib",
    "GiB",
    "Tb",
    "TB",
    "Tib",
    "TiB",
    "Pb",
    "PB",
    "Pib",
    "PiB",
    "Eb",
    "EB",
    "Eib",
    "EiB",
    "Zb",
    "ZB",
    "Zib",
    "ZiB",
    "Yb",
    "YB",
    "Yib",
    "YiB",
  ];
  const formatDc = inputDatacap
    .replace(/[t]/g, "T")
    .replace(/[b]/g, "B")
    .replace(/[p]/g, "P")
    .replace(/[I]/g, "i")
    .replace(/\s*/g, "");
  const ext = formatDc.replace(/[0-9.]/g, "");

  if (!allowedExtensions.includes(ext)) {
    throw new Error(
      `Invalid datacap format. Allowed extensions are: ${allowedExtensions.join(
        ", ",
      )}`,
    );
  }
  const datacap = formatDc.replace(/[^0-9.]/g, "");
  const bytes = byteConverter.convert(parseFloat(datacap), ext, "B");
  return bytes;
}

/**
 * This function is used to convert bytes to string formatted bytes iB
 *
 * @param inputBytes
 * @returns string
 */
export function bytesToiB(inputBytes: number): string {
  const options: {
    preferByte: boolean;
    preferBinary: boolean;
  } = {
    preferByte: true,
    preferBinary: true,
  };
  let autoscale = byteConverter.autoScale(
    inputBytes,
    "B",
    options as ByteConverterAutoscaleOptions,
  );
  // this is bc it cannot convert 1099511627776000 to 1PiB and it convert to 9 YiB
  let stringVal = "";
  if (autoscale.dataFormat === "YiB") {
    autoscale = byteConverter.autoScale(
      inputBytes - 32,
      "B",
      options as ByteConverterAutoscaleOptions,
    );
    return `${autoscale.value.toFixed(1)}${autoscale.dataFormat}`;
  }
  stringVal = String(autoscale.value);

  const indexOfDot = stringVal.indexOf(".");
  return `${stringVal.substring(
    0,
    indexOfDot > 0 ? indexOfDot : stringVal.length,
  )}${indexOfDot > 0 ? stringVal.substring(indexOfDot, indexOfDot + 3) : ""}${
    autoscale.dataFormat
  }`;
}

/**
 * This function is used to convert bytes to string formatted bytes B
 *
 * @param inputBytes
 * @returns string
 */
export function bytesToB(inputBytes: number): string {
  const options: {
    preferByte: boolean;
    preferBinary: boolean;
  } = {
    preferByte: true,
    preferBinary: true,
  };
  const autoscale = byteConverter.autoScale(
    inputBytes,
    "B",
    options as ByteConverterAutoscaleOptions,
  );
  return `${
    Number.isInteger(autoscale.value)
      ? autoscale.value
      : autoscale.value.toFixed(1)
  }${autoscale.dataFormat}`;
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
