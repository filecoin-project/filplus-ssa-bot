import { mockApiClients, mockIssues, mockSingleIssue } from "./mockData";
import { type ApiClientsResponse } from "../types/types";

export const getApiClientsMock = async (): Promise<ApiClientsResponse> => ({
  data: mockApiClients,
  error: "",
  success: true,
});

export const getIssuesMock = async () => mockIssues;

export const getIssueMock = async (issueNumber: number) => mockSingleIssue;
