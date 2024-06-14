import { checkApplications, checkApplication } from "../bot/checkApplications";
import "jest-expect-message";

import * as filplusService from "../services/filplusService";
import * as backendService from "../services/backendService";
import * as consoleLogger from "../utils/consoleLogger";

import { type Application } from "../types/types";

/**
 * Test suite for checkApplications.ts
 */
describe("Datacap Allocation Functions", () => {
  /**
   * Tests for checkApplications general functionality.
   */
  describe("checkApplications", () => {
    /**
     * Before each test, mock `postApplicationRefill` in order to return a success response.
     */
    beforeEach(() => {
      jest.spyOn(backendService, "postApplicationRefill").mockResolvedValue({
        error: "",
        success: true,
      });
    });

    /**
     * After each test, restore all mocks.
     */
    afterEach(() => {
      jest.restoreAllMocks(); // Restore all mocks after each test
    });

    /**
     * Test case for when DMob API returns error.
     */
    it("should handle apiClients error", async () => {
      // Mock `getApiClients` in order to return an error.
      jest.spyOn(filplusService, "getApiClients").mockResolvedValue({
        data: [],
        error: "Test error from getApiClients",
        success: false,
      });

      // Mock logError in order to check if it was called with the expected error.
      const logErrorSpy = jest.spyOn(consoleLogger, "logError");

      await checkApplications();

      // Verify that logError was called with the expected error.
      expect(logErrorSpy).toHaveBeenCalledWith(
        "Get Api Clients Error: Test error from getApiClients",
      );
    });

    /**
     * Test case for when backend API returns error.
     */
    it("should handle getApplications error", async () => {
      // Mock `getApplications` in order to return an empty array.
      jest.spyOn(backendService, "getApplications").mockResolvedValue({
        data: [],
        error: "Mocking test error from getApplications",
        success: false,
      });

      // Mock `getApiClients` in order to return an error.
      jest.spyOn(filplusService, "getApiClients").mockResolvedValue({
        data: [],
        error: "",
        success: true,
      });

      // Mock logError in order to check if it was called with the expected error.
      const logErrorSpy = jest.spyOn(consoleLogger, "logError");

      await checkApplications();

      // Verify that logError was called with the expected error.
      expect(logErrorSpy).toHaveBeenCalledWith(
        "Get Applications Error: Mocking test error from getApplications",
      );
    });
  });

  /**
   * Tests for single application functionality.
   */
  describe("checkApplication", () => {
    let apiClients;

    /**
     * Before each test, mock `postApplicationRefill` in order to return a success response.
     */
    beforeEach(() => {
      jest.spyOn(backendService, "postApplicationRefill").mockResolvedValue({
        error: "Test error from getApiClients",
        success: true,
      });
    });

    /**
     * Before all tests, get the list of apiClients from DMob API.
     */
    beforeAll(async () => {
      const { data, success } = await filplusService.getApiClients();
      expect(success).toBe(true);
      apiClients = data;
    });

    /**
     * After each test, restore all mocks.
     */
    afterEach(() => {
      jest.restoreAllMocks(); // Restore all mocks after each test
    });

    /**
     * Test case for when application has no datacap allocations.
     */
    it("should handle case when datacap_allocations is empty", async () => {
      const app: Application = {
        Version: 1,
        ID: "f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1v",
        "Issue Number": "359",
        Client: {
          Name: "ClientNme",
          Region: "Afghanistan",
          Industry: "ClientIndustry",
          Website: "ClientWebsite",
          "Social Media": "ClientSM",
          "Social Media Type": "Twitter",
          Role: "ClientRole",
        },
        Project: {
          "Project Id": "IDID",
          "Brief history of your project and organization": "history",
          "Is this project associated with other projects/ecosystem stakeholders?":
            "asodfjads",
          "Describe the data being stored onto Filecoin": "jkjkjk",
          "Where was the data currently stored in this dataset sourced from} ":
            "dsadsa",
          "How do you plan to prepare the dataset": "Otherrrew",
          "Please share a sample of the data (a link to a file, an image, a table, etc., are good ways to do this.)":
            "linkme",
          "Confirm that this is a public dataset that can be retrieved by anyone on the network (i.e., no specific permissions or access rights are required to view the data)":
            "confirm",
          "What is the expected retrieval frequency for this data": "hello",
          "For how long do you plan to keep this dataset stored on Filecoin":
            "long",
          "In which geographies do you plan on making storage deals": "jewoq",
          "How will you be distributing your data to storage providers":
            "rewerw",
          "Please list the provider IDs and location of the storage providers you will be working with. Note that it is a requirement to list a minimum of 5 unique provider IDs, and that your client address will be verified against this list in the future":
            "rewrew",
          "Can you confirm that you will follow the Fil+ guideline (Data owner should engage at least 4 SPs and no single SP ID should receive >30% of a client's allocated DataCap)":
            "",
        },
        Datacap: {
          Type: "ldn-v3",
          "Data Type": "Slingshot",
          "Total Requested Amount": "11GB",
          "Single Size Dataset": "1GB",
          Replicas: 2,
          "Weekly Allocation": "1GB",
        },
        Lifecycle: {
          State: "ReadyToSign",
          "Validated At": "2023-10-30 10:34:12.894949811 UTC",
          "Validated By": "actor_address",
          Active: true,
          "Updated At": "2023-10-30 10:34:12.894961433 UTC",
          "Active Request ID": "22f7d64e-6b59-4909-90b3-5fc810b528ef",
          "On Chain Address": "f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1v",
          "Multisig Address": "MULTISIG ADDRESS",
        },
        "Allocation Requests": [
          {
            ID: "22f7d64e-6b59-4909-90b3-5fc810b528ef",
            "Request Type": "First",
            "Created At": "2023-10-30 10:34:12.894964779 UTC",
            "Updated At": "2023-10-30 10:34:12.894966582 UTC",
            Active: true,
            "Allocation Amount": "11GB",
            Signers: [],
          },
        ],
      };

      const logSpy = jest.spyOn(console, "log");
      await checkApplication(app, [], "keyko-io", "test-philip-the-second");
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          "the issue still needs to get the 1st round of datacap",
        ),
      );
    });

    /**
     * Test case for when no client is found.
     */
    it("should handle case when no client is found", async () => {
      const app: Application = {
        Version: 1,
        ID: "f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1v",
        "Issue Number": "359",
        Client: {
          Name: "ClientNme",
          Region: "Afghanistan",
          Industry: "ClientIndustry",
          Website: "ClientWebsite",
          "Social Media": "ClientSM",
          "Social Media Type": "Twitter",
          Role: "ClientRole",
        },
        Project: {
          "Project Id": "IDID",
          "Brief history of your project and organization": "history",
          "Is this project associated with other projects/ecosystem stakeholders?":
            "asodfjads",
          "Describe the data being stored onto Filecoin": "jkjkjk",
          "Where was the data currently stored in this dataset sourced from} ":
            "dsadsa",
          "How do you plan to prepare the dataset": "Otherrrew",
          "Please share a sample of the data (a link to a file, an image, a table, etc., are good ways to do this.)":
            "linkme",
          "Confirm that this is a public dataset that can be retrieved by anyone on the network (i.e., no specific permissions or access rights are required to view the data)":
            "confirm",
          "What is the expected retrieval frequency for this data": "hello",
          "For how long do you plan to keep this dataset stored on Filecoin":
            "long",
          "In which geographies do you plan on making storage deals": "jewoq",
          "How will you be distributing your data to storage providers":
            "rewerw",
          "Please list the provider IDs and location of the storage providers you will be working with. Note that it is a requirement to list a minimum of 5 unique provider IDs, and that your client address will be verified against this list in the future":
            "rewrew",
          "Can you confirm that you will follow the Fil+ guideline (Data owner should engage at least 4 SPs and no single SP ID should receive >30% of a client's allocated DataCap)":
            "",
        },
        Datacap: {
          Type: "ldn-v3",
          "Data Type": "Slingshot",
          "Total Requested Amount": "11GB",
          "Single Size Dataset": "1GB",
          Replicas: 2,
          "Weekly Allocation": "1GB",
        },
        Lifecycle: {
          State: "ReadyToSign",
          "Validated At": "2023-10-30 10:34:12.894949811 UTC",
          "Validated By": "actor_address",
          Active: true,
          "Updated At": "2023-10-30 10:34:12.894961433 UTC",
          "Active Request ID": "22f7d64e-6b59-4909-90b3-5fc810b528ef",
          "On Chain Address": "Address1",
          "Multisig Address": "MULTISIG ADDRESS",
        },
        "Allocation Requests": [
          {
            ID: "22f7d64e-6b59-4909-90b3-5fc810b528ef",
            "Request Type": "First",
            "Created At": "2023-10-30 10:34:12.894964779 UTC",
            "Updated At": "2023-10-30 10:34:12.894966582 UTC",
            Active: true,
            "Allocation Amount": "11GB",
            Signers: [],
          },
        ],
      };
      const logSpy = jest.spyOn(console, "log");
      await checkApplication(app, [], "keyko-io", "test-philip-the-second");
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining("No client found for address Address1"),
      );
    });

    /**
     * Test case for when getAllowanceForAddress returns error.
     */
    it("should handle case when getAllowanceForAddress fails", async () => {
      const app: Application = {
        Version: 1,
        ID: "f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1v",
        "Issue Number": "359",
        Client: {
          Name: "ClientNme",
          Region: "Afghanistan",
          Industry: "ClientIndustry",
          Website: "ClientWebsite",
          "Social Media": "ClientSM",
          "Social Media Type": "Twitter",
          Role: "ClientRole",
        },
        Project: {
          "Project Id": "IDID",
          "Brief history of your project and organization": "history",
          "Is this project associated with other projects/ecosystem stakeholders?":
            "asodfjads",
          "Describe the data being stored onto Filecoin": "jkjkjk",
          "Where was the data currently stored in this dataset sourced from} ":
            "dsadsa",
          "How do you plan to prepare the dataset": "Otherrrew",
          "Please share a sample of the data (a link to a file, an image, a table, etc., are good ways to do this.)":
            "linkme",
          "Confirm that this is a public dataset that can be retrieved by anyone on the network (i.e., no specific permissions or access rights are required to view the data)":
            "confirm",
          "What is the expected retrieval frequency for this data": "hello",
          "For how long do you plan to keep this dataset stored on Filecoin":
            "long",
          "In which geographies do you plan on making storage deals": "jewoq",
          "How will you be distributing your data to storage providers":
            "rewerw",
          "Please list the provider IDs and location of the storage providers you will be working with. Note that it is a requirement to list a minimum of 5 unique provider IDs, and that your client address will be verified against this list in the future":
            "rewrew",
          "Can you confirm that you will follow the Fil+ guideline (Data owner should engage at least 4 SPs and no single SP ID should receive >30% of a client's allocated DataCap)":
            "",
        },
        Datacap: {
          Type: "ldn-v3",
          "Data Type": "Slingshot",
          "Total Requested Amount": "11GB",
          "Single Size Dataset": "1GB",
          Replicas: 2,
          "Weekly Allocation": "1GB",
        },
        Lifecycle: {
          State: "ReadyToSign",
          "Validated At": "2023-10-30 10:34:12.894949811 UTC",
          "Validated By": "actor_address",
          Active: true,
          "Updated At": "2023-10-30 10:34:12.894961433 UTC",
          "Active Request ID": "22f7d64e-6b59-4909-90b3-5fc810b528ef",
          "On Chain Address": "f1q5qokywmvh4xdn2g7snu3ysah4bbp6iyqx3kcry",
          "Multisig Address": "MULTISIG ADDRESS",
        },
        "Allocation Requests": [
          {
            ID: "22f7d64e-6b59-4909-90b3-5fc810b528ef",
            "Request Type": "First",
            "Created At": "2023-10-30 10:34:12.894964779 UTC",
            "Updated At": "2023-10-30 10:34:12.894966582 UTC",
            Active: true,
            "Allocation Amount": "11GB",
            Signers: [],
          },
        ],
      };

      jest.spyOn(filplusService, "getAllowanceForAddress").mockResolvedValue({
        data: "541268958511104",
        error: "Error getting allowance for address in test",
        success: false,
      });
      await expect(
        checkApplication(app, apiClients, "keyko-io", "test-philip-the-second"),
      ).rejects.toThrow("Error getting allowance for address in test");
    }, 60000);

    /**
     * Test case for when getLastRequestAllowance returns undefined.
     */
    it("should handle case when there are no active allowances", async () => {
      const app: Application = {
        Version: 1,
        ID: "f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1v",
        "Issue Number": "359",
        Client: {
          Name: "ClientNme",
          Region: "Afghanistan",
          Industry: "ClientIndustry",
          Website: "ClientWebsite",
          "Social Media": "ClientSM",
          "Social Media Type": "Twitter",
          Role: "ClientRole",
        },
        Project: {
          "Project Id": "IDID",
          "Brief history of your project and organization": "history",
          "Is this project associated with other projects/ecosystem stakeholders?":
            "asodfjads",
          "Describe the data being stored onto Filecoin": "jkjkjk",
          "Where was the data currently stored in this dataset sourced from} ":
            "dsadsa",
          "How do you plan to prepare the dataset": "Otherrrew",
          "Please share a sample of the data (a link to a file, an image, a table, etc., are good ways to do this.)":
            "linkme",
          "Confirm that this is a public dataset that can be retrieved by anyone on the network (i.e., no specific permissions or access rights are required to view the data)":
            "confirm",
          "What is the expected retrieval frequency for this data": "hello",
          "For how long do you plan to keep this dataset stored on Filecoin":
            "long",
          "In which geographies do you plan on making storage deals": "jewoq",
          "How will you be distributing your data to storage providers":
            "rewerw",
          "Please list the provider IDs and location of the storage providers you will be working with. Note that it is a requirement to list a minimum of 5 unique provider IDs, and that your client address will be verified against this list in the future":
            "rewrew",
          "Can you confirm that you will follow the Fil+ guideline (Data owner should engage at least 4 SPs and no single SP ID should receive >30% of a client's allocated DataCap)":
            "",
        },
        Datacap: {
          Type: "ldn-v3",
          "Data Type": "Slingshot",
          "Total Requested Amount": "11GB",
          "Single Size Dataset": "1GB",
          Replicas: 2,
          "Weekly Allocation": "1GB",
        },
        Lifecycle: {
          State: "ReadyToSign",
          "Validated At": "2023-10-30 10:34:12.894949811 UTC",
          "Validated By": "actor_address",
          Active: true,
          "Updated At": "2023-10-30 10:34:12.894961433 UTC",
          "Active Request ID": "22f7d64e-6b59-4909-90b3-5fc810b528ef",
          "On Chain Address": "f1q5qokywmvh4xdn2g7snu3ysah4bbp6iyqx3kcry",
          "Multisig Address": "MULTISIG ADDRESS",
        },
        "Allocation Requests": [
          {
            ID: "22f7d64e-6b59-4909-90b3-5fc810b528ef",
            "Request Type": "First",
            "Created At": "2023-10-30 10:34:12.894964779 UTC",
            "Updated At": "2023-10-30 10:34:12.894966582 UTC",
            Active: true,
            "Allocation Amount": "11GB",
            Signers: [],
          },
        ],
      };

      const logSpy = jest.spyOn(console, "log");
      await checkApplication(
        app,
        apiClients,
        "keyko-io",
        "test-philip-the-second",
      );
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining("No active last request allowance found"),
      );
    }, 60000);

    it("should handle case when there are just one active allowance", async () => {
      const app: Application = {
        Version: 1,
        ID: "f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1v",
        "Issue Number": "359",
        Client: {
          Name: "ClientNme",
          Region: "Afghanistan",
          Industry: "ClientIndustry",
          Website: "ClientWebsite",
          "Social Media": "ClientSM",
          "Social Media Type": "Twitter",
          Role: "ClientRole",
        },
        Project: {
          "Project Id": "IDID",
          "Brief history of your project and organization": "history",
          "Is this project associated with other projects/ecosystem stakeholders?":
            "asodfjads",
          "Describe the data being stored onto Filecoin": "jkjkjk",
          "Where was the data currently stored in this dataset sourced from} ":
            "dsadsa",
          "How do you plan to prepare the dataset": "Otherrrew",
          "Please share a sample of the data (a link to a file, an image, a table, etc., are good ways to do this.)":
            "linkme",
          "Confirm that this is a public dataset that can be retrieved by anyone on the network (i.e., no specific permissions or access rights are required to view the data)":
            "confirm",
          "What is the expected retrieval frequency for this data": "hello",
          "For how long do you plan to keep this dataset stored on Filecoin":
            "long",
          "In which geographies do you plan on making storage deals": "jewoq",
          "How will you be distributing your data to storage providers":
            "rewerw",
          "Please list the provider IDs and location of the storage providers you will be working with. Note that it is a requirement to list a minimum of 5 unique provider IDs, and that your client address will be verified against this list in the future":
            "rewrew",
          "Can you confirm that you will follow the Fil+ guideline (Data owner should engage at least 4 SPs and no single SP ID should receive >30% of a client's allocated DataCap)":
            "",
        },
        Datacap: {
          Type: "ldn-v3",
          "Data Type": "Slingshot",
          "Total Requested Amount": "11GB",
          "Single Size Dataset": "1GB",
          Replicas: 2,
          "Weekly Allocation": "1GB",
        },
        Lifecycle: {
          State: "ReadyToSign",
          "Validated At": "2023-10-30 10:34:12.894949811 UTC",
          "Validated By": "actor_address",
          Active: true,
          "Updated At": "2023-10-30 10:34:12.894961433 UTC",
          "Active Request ID": "22f7d64e-6b59-4909-90b3-5fc810b528ef",
          "On Chain Address": "f1q5qokywmvh4xdn2g7snu3ysah4bbp6iyqx3kcry",
          "Multisig Address": "MULTISIG ADDRESS",
        },
        "Allocation Requests": [
          {
            ID: "22f7d64e-6b59-4909-90b3-5fc810b528ef",
            "Request Type": "First",
            "Created At": "2023-10-30 10:34:12.894964779 UTC",
            "Updated At": "2023-10-30 10:34:12.894966582 UTC",
            Active: true,
            "Allocation Amount": "11GB",
            Signers: [],
          },
        ],
      };
      const logSpy = jest.spyOn(console, "log");
      await checkApplication(
        app,
        apiClients,
        "keyko-io",
        "test-philip-the-second",
      );
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining("No active last request allowance found"),
      );
    }, 60000);

    it("should compute correct margin", async () => {
      const app: Application = {
        Version: 1,
        ID: "f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1v",
        "Issue Number": "359",
        Client: {
          Name: "ClientNme",
          Region: "Afghanistan",
          Industry: "ClientIndustry",
          Website: "ClientWebsite",
          "Social Media": "ClientSM",
          "Social Media Type": "Twitter",
          Role: "ClientRole",
        },
        Project: {
          "Project Id": "IDID",
          "Brief history of your project and organization": "history",
          "Is this project associated with other projects/ecosystem stakeholders?":
            "asodfjads",
          "Describe the data being stored onto Filecoin": "jkjkjk",
          "Where was the data currently stored in this dataset sourced from} ":
            "dsadsa",
          "How do you plan to prepare the dataset": "Otherrrew",
          "Please share a sample of the data (a link to a file, an image, a table, etc., are good ways to do this.)":
            "linkme",
          "Confirm that this is a public dataset that can be retrieved by anyone on the network (i.e., no specific permissions or access rights are required to view the data)":
            "confirm",
          "What is the expected retrieval frequency for this data": "hello",
          "For how long do you plan to keep this dataset stored on Filecoin":
            "long",
          "In which geographies do you plan on making storage deals": "jewoq",
          "How will you be distributing your data to storage providers":
            "rewerw",
          "Please list the provider IDs and location of the storage providers you will be working with. Note that it is a requirement to list a minimum of 5 unique provider IDs, and that your client address will be verified against this list in the future":
            "rewrew",
          "Can you confirm that you will follow the Fil+ guideline (Data owner should engage at least 4 SPs and no single SP ID should receive >30% of a client's allocated DataCap)":
            "",
        },
        Datacap: {
          Type: "ldn-v3",
          "Data Type": "Slingshot",
          "Total Requested Amount": "11GB",
          "Single Size Dataset": "1GB",
          Replicas: 2,
          "Weekly Allocation": "1GB",
        },
        Lifecycle: {
          State: "ReadyToSign",
          "Validated At": "2023-10-30 10:34:12.894949811 UTC",
          "Validated By": "actor_address",
          Active: true,
          "Updated At": "2023-10-30 10:34:12.894961433 UTC",
          "Active Request ID": "22f7d64e-6b59-4909-90b3-5fc810b528ef",
          "On Chain Address": "f1q5qokywmvh4xdn2g7snu3ysah4bbp6iyqx3kcry",
          "Multisig Address": "MULTISIG ADDRESS",
        },
        "Allocation Requests": [
          {
            ID: "22f7d64e-6b59-4909-90b3-5fc810b528ef",
            "Request Type": "First",
            "Created At": "2023-10-30 10:34:12.894964779 UTC",
            "Updated At": "2023-10-30 10:34:12.894966582 UTC",
            Active: true,
            "Allocation Amount": "11GB",
            Signers: [],
          },
        ],
      };
      const logSpy = jest.spyOn(console, "log");
      jest.spyOn(filplusService, "getAllowanceForAddress").mockResolvedValue({
        data: "541268958511104",
        error: "",
        success: true,
      });
      await checkApplication(
        app,
        apiClients,
        "keyko-io",
        "test-philip-the-second",
      );
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          "datacap remaining / datacap allocated: 48.07% - doesn't need more allowance",
        ),
      );
    }, 60000);

    it("should compute correct allocation to request", async () => {
      const app: Application = {
        Version: 1,
        ID: "f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1v",
        "Issue Number": "359",
        Client: {
          Name: "ClientNme",
          Region: "Afghanistan",
          Industry: "ClientIndustry",
          Website: "ClientWebsite",
          "Social Media": "ClientSM",
          "Social Media Type": "Twitter",
          Role: "ClientRole",
        },
        Project: {
          "Project Id": "IDID",
          "Brief history of your project and organization": "history",
          "Is this project associated with other projects/ecosystem stakeholders?":
            "asodfjads",
          "Describe the data being stored onto Filecoin": "jkjkjk",
          "Where was the data currently stored in this dataset sourced from} ":
            "dsadsa",
          "How do you plan to prepare the dataset": "Otherrrew",
          "Please share a sample of the data (a link to a file, an image, a table, etc., are good ways to do this.)":
            "linkme",
          "Confirm that this is a public dataset that can be retrieved by anyone on the network (i.e., no specific permissions or access rights are required to view the data)":
            "confirm",
          "What is the expected retrieval frequency for this data": "hello",
          "For how long do you plan to keep this dataset stored on Filecoin":
            "long",
          "In which geographies do you plan on making storage deals": "jewoq",
          "How will you be distributing your data to storage providers":
            "rewerw",
          "Please list the provider IDs and location of the storage providers you will be working with. Note that it is a requirement to list a minimum of 5 unique provider IDs, and that your client address will be verified against this list in the future":
            "rewrew",
          "Can you confirm that you will follow the Fil+ guideline (Data owner should engage at least 4 SPs and no single SP ID should receive >30% of a client's allocated DataCap)":
            "",
        },
        Datacap: {
          Type: "ldn-v3",
          "Data Type": "Slingshot",
          "Total Requested Amount": "11GB",
          "Single Size Dataset": "1GB",
          Replicas: 2,
          "Weekly Allocation": "1GB",
        },
        Lifecycle: {
          State: "ReadyToSign",
          "Validated At": "2023-10-30 10:34:12.894949811 UTC",
          "Validated By": "actor_address",
          Active: true,
          "Updated At": "2023-10-30 10:34:12.894961433 UTC",
          "Active Request ID": "22f7d64e-6b59-4909-90b3-5fc810b528ef",
          "On Chain Address": "f1q5qokywmvh4xdn2g7snu3ysah4bbp6iyqx3kcry",
          "Multisig Address": "MULTISIG ADDRESS",
        },
        "Allocation Requests": [
          {
            ID: "22f7d64e-6b59-4909-90b3-5fc810b528ef",
            "Request Type": "First",
            "Created At": "2023-10-30 10:34:12.894964779 UTC",
            "Updated At": "2023-10-30 10:34:12.894966582 UTC",
            Active: true,
            "Allocation Amount": "11GB",
            Signers: [],
          },
        ],
      };

      jest.spyOn(filplusService, "getAllowanceForAddress").mockResolvedValue({
        data: "41268958511104",
        error: "",
        success: true,
      });
      const mockPostApplicationRefill = jest
        .spyOn(backendService, "postApplicationRefill")
        .mockImplementation(
          async () =>
            await Promise.resolve({
              error: "",
              success: true,
            }),
        );
      await checkApplication(
        app,
        apiClients,
        "keyko-io",
        "test-philip-the-second",
      );
      expect(mockPostApplicationRefill).toHaveBeenCalledWith(
        "222",
        "keyko-io",
        "test-philip-the-second",
        "512",
        "TiB",
      );
    }, 60000);
  });

  /**
   * Tests for postApplicationRefill functionality.
   */
  describe("postApplicationRefill", () => {
    it("should return correct data when calling postApplicationRefill", async () => {
      const ret = await backendService.postApplicationRefill(
        "222",
        "keyko-io",
        "test-philip-the-second",
        "500",
        "TiB",
      );
      expect(ret.success).toEqual(true);
    }, 60000);
  });

  /**
   * Tests for postApplicationTotalDCReached functionality.
   */
  describe("postApplicationTotalDCReached", () => {
    // TODO: When endpoint is ready, uncomment this test
    // it("should return correct data when calling postApplicationTotalDCReached", async () => {
    //   const ret = await backendService.postApplicationTotalDCReached("222");
    //   expect(ret.success).toEqual(true);
    // }, 60000);
  });
});
