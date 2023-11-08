import dotenv from "dotenv";
import v3_exception_test from "@keyko-io/filecoin-content/json/test/v3_exceptions_test.json";
import v3_exception_prod from "@keyko-io/filecoin-content/json/prod/v3_exceptions_prod.json";
// dotenv.config({ path: `.env.${process.env.NODE_ENV}` })
dotenv.config({ path: `./.env` });

export const config = {
  githubToken: process.env.GITHUB_TOKEN,
  githubLDNOwner: process.env.GITHUB_LDN_REPO_OWNER ?? "keyko-io",
  githubLDNRepo:
    process.env.GITHUB_LDN_REPO ?? "filecoin-large-clients-onboarding",
  networkType: process.env.NETWORK_TYPE ?? "Mainnet",
  filplusApi: "https://api.filplus.d.interplanetary.one/public/api",
  backendApi: process.env.BACKEND_API_URL ?? "http://localhost:8080",
  filplusApiKey: process.env.DMOB_API_KEY,
  appId: process.env.APP_ID,
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,

  testAppId: process.env.TEST_APP_ID,
  testClientId: process.env.TEST_CLIENT_ID,
  testClientSecret: process.env.TEST_CLIENT_SECRET,
  testPrivateKey: process.env.TEST_GIT_PRIVATE_KEY,
  testInstallationID: process.env.TEST_INSTALLATION_ID,
  testGithubLDNOwner: process.env.TEST_GITHUB_LDN_REPO_OWNER ?? "keyko-io",
  testGithubLDNRepo:
    process.env.TEST_GITHUB_LDN_REPO ?? "filecoin-large-clients-onboarding",

  beginPk: process.env.GIT_BEGIN_PK ?? `-----BEGIN RSA PRIVATE KEY-----`,
  endPk: process.env.GIT_END_PK ?? `-----END RSA PRIVATE KEY-----`,
  privateKey: process.env.GIT_PRIVATE_KEY,
  installationID: process.env.INSTALLATION_ID,
  notariersJsonPath: process.env.VERIFIERS_JSON_PATH_PROD,
  logPrefix: "Application ID",
  v3MultisigAddress: process.env.V3_MULTISIG_ADDRESS ?? "t01003",
  v3MultisigIssueNumber:
    process.env.V3_MULTISIG_ISSUE_NUMBER !== undefined
      ? Number(process.env.V3_MULTISIG_ISSUE_NUMBER)
      : 479,
  v3MultisigDatacapAllowance: "100PiB",
  v3MarginComparisonPercentage: 0.25,
  v3MultisigDatacapAllowanceBytes: 100 * 2 ** 50, // 100PiB
  exceptionJson:
    process.env.NODE_ENV === "test" ? v3_exception_test : v3_exception_prod,
  HALF_PIB: 2 ** 49, // 0.5PiB
  ONE_PIB: 2 ** 50, // 1PiB
  TWO_PIB: 2 ** 51, // 2PiB
  healthCheckIssue:
    process.env.HEALTH_CEHECK_ISSUE !== undefined
      ? Number(process.env.HEALTH_CEHECK_ISSUE)
      : 1,
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
};
