import { config } from "../config";

const ENVIRONMENT = config.networkType;
const PHASE = `Subsequent Allocation`;

export const logGeneral = (message: string): void => {
  if (!checkEnvTestLog(message)) return;
  console.log(`[${PHASE}] INFO ${message}`);
};
export const logWarn = (message: string): void => {
  if (!checkEnvTestLog(message)) return;
  console.warn(`[${PHASE}] WARN ${message}`);
};
export const logDebug = (message: string): void => {
  if (!checkEnvTestLog(message)) return;
  console.debug(`[${PHASE}] DEBUG ${message}`);
};
export const logError = (message: string): void => {
  if (!checkEnvTestLog(message)) return;
  console.error(`[${PHASE}] ${message}`);
};

const checkEnvTestLog = (message: string): boolean => {
  if (ENVIRONMENT === "test") {
    console.log(`testLog [${PHASE}] INFO ${message}`);
    return false;
  }
  return true;
};
