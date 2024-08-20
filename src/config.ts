import dotenv from "dotenv";
dotenv.config({ path: `./.env` });

export const config = {
  filplusApi:
    process.env.DMOB_API_URL ?? "https://api.datacapstats.io/public/api",
  filplusApiKey: process.env.DMOB_API_KEY,
  backendApi: process.env.BACKEND_API_URL ?? "http://localhost:8080",
  logPrefix: "Application ID",
  HALF_PIB: 2 ** 49, // 0.5PiB
  ONE_PIB: 2 ** 50, // 1PiB
  TWO_PIB: 2 ** 51, // 2PiB
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
  networkType: process.env.NETWORK_TYPE ?? "production",
};
