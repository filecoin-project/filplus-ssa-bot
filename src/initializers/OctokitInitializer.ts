import { config } from "../config";
import { Octokit } from "@octokit/rest";
import { createAppAuth } from "@octokit/auth-app";

const formatPK = (): string => {
  const BEGIN = config.beginPk;
  const END = config.endPk;
  const splitted = config?.privateKey?.match(/.{1,64}/g);
  const formatted = `${BEGIN}\n${splitted?.join("\n")}\n${END}`;
  return formatted;
};

const formatTestPK = (): string => {
  const BEGIN = config.beginPk;
  const END = config.endPk;
  const splitted = config?.testPrivateKey?.match(/.{1,64}/g);
  const formatted = `${BEGIN}\n${splitted?.join("\n")}\n${END}`;
  return formatted;
};

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class OctokitInitializer {
  private static octoInstance: Octokit;
  private static testOctoInstance: Octokit;

  public static getInstance(): Octokit {
    if (this.octoInstance === null || this.octoInstance === undefined) {
      this.octoInstance = new Octokit({
        authStrategy: createAppAuth,
        auth: {
          type: "installation",
          installationId: config.installationID,
          appId: config.appId,
          privateKey: formatPK(),
          clientId: config.clientId,
          clientSecret: config.clientSecret,
        },
      });
    }

    return this.octoInstance;
  }

  public static getTestInstance(): Octokit {
    if (this.testOctoInstance === null || this.testOctoInstance === undefined) {
      this.testOctoInstance = new Octokit({
        authStrategy: createAppAuth,
        auth: {
          type: "installation",
          installationId: config.testInstallationID,
          appId: config.testAppId,
          privateKey: formatTestPK(),
          clientId: config.testClientId,
          clientSecret: config.testClientSecret,
        },
      });
    }

    return this.testOctoInstance;
  }
}
