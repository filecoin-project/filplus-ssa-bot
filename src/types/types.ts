export interface ApiClientsResponse {
  error: string;
  success: boolean;
  data: DmobClient[];
}

export interface ApiAllowanceResponse {
  error: string;
  success: boolean;
  data: string;
}

export interface ByteConverterAutoscaleOptions {
  preferByte: boolean;
  preferBit: boolean;
  preferBinary: boolean;
  preferDecimal: boolean;
  preferSameBase: boolean;
  preferOppositeBase: boolean;
  preferSameUnit: boolean;
  preferOppositeUnit: boolean;
  // eslint-disable-next-line @typescript-eslint/ban-types
  handler: (curDataFormat: string, isUppingDataFormat: boolean) => {};
}

export interface AllowanceArrayElement {
  // --> sum of it: total datacap granted so far
  id: number; // 5160,
  error: string; // allocation event not found,
  height: number; // 2705021,
  msgCID: string; // bafy2bzacecjpejuzmxolhrqxgaa4owf7pmob372stq46zgfaf77dkdck6idwi,
  retries: number; // 0,
  addressId: string; // f02041788,
  allowance: string; // 109951162777600,
  auditTrail: string; // https://github.com/filecoin-project/filecoin-plus-large-datasets/issues/1538,
  allowanceTTD: number | null; // null,
  usedAllowance: string; // 0,
  isLdnAllowance: boolean; // true,
  isEFilAllowance: boolean; // false,
  verifierAddressId: string; // f02049625,
  isFromAutoverifier: boolean; // false,
  searchedByProposal: boolean; // true,
  issueCreateTimestamp: number; // 1673055536,
  hasRemainingAllowance: boolean; // true,
  createMessageTimestamp: number; // 1679457030
}

export interface DmobClient {
  id: number;
  addressId: string;
  address: string;
  retries: number;
  auditTrail: string;
  name: string;
  orgName: string;
  region: string;
  website: string;
  industry: string;
  initialAllowance: string; // '281474976710656',
  allowance: string; // '304530361155584', -- REMAINING DATACAP
  verifierAddressId: string; // 'f01858410',
  createdAtHeight: number;
  issueCreateTimestamp: string | number;
  createMessageTimestamp: number; // 1677829860,
  verifierName: string; // 'LDN v3 multisig',
  dealCount: number; // null,
  providerCount: number; // null,
  topProvider: string | number; // null,
  receivedDatacapChange: string; // '562949953421312',
  usedDatacapChange: string; // '505534830608384',
  allowanceArray: AllowanceArrayElement[];
}

export interface AutoScaleOptions {
  preferByte: boolean;
  preferBinary: boolean;
}

export interface RequestAmount {
  amount: number | string;
  amountType: string;
  rule: string;
  totalDatacapReached: boolean;
}

export enum EVENT_TYPE {
  CREATE_APPLICATION = "create_application",
  MULTISIG_CREATION = "multisig_creation",
  MULTISIG_APPROVED = "multisig_approved",
  FIRST_DC_REQUEST = "first_datacap_request",
  DC_ALLOCATION = "datacap_allocation",
  SUBSEQUENT_DC_REQUEST = "subsequent_datacap_request",
  APPLICATION_IS_GOOD = "application_is_good",
  APPLICATION_HAS_ERRORS = "application_has_errors",
}

/**
 * @amount amount of dc requested / allocated
 * @requestNumber number of request for ssa allocation
 * @approvers who approved the last request
 */
export interface MetricsApiParams {
  eventDate?: string | number;
  name?: string;
  clientAddress?: string;
  msigAddress?: string;
  amount?: string;
  requestNumber?: string | number;
  messageCid?: string | number;
  uuid?: string;
}

export interface MetricsData {
  applicationsListed?: number;
  applicationsSkipped?: number;
  ApplicationsProcessed?: number;
  ApplicationsAllocationRequested?: number;
  startTimestamp?: number;
  endTimestamp?: number;
  execResult?: number;
}

export interface Application {
  Version: number;
  ID: string;
  "Issue Number": string;
  Client: Client;
  Project: Record<string, unknown>;
  Datacap: Datacap;
  Lifecycle: Lifecycle;
  "Allocation Requests": AllocationRequest[];
}

export interface Client {
  Name: string;
  Region: string;
  Industry: string;
  Website: string;
  "Social Media": string;
  "Social Media Type": string;
  Role: string;
}

export interface Datacap {
  Type: string;
  "Data Type": string;
  "Total Requested Amount": string;
  "Single Size Dataset": string;
  Replicas: number;
  "Weekly Allocation": string;
}

export interface Lifecycle {
  State:
    | "Submitted"
    | "ReadyToSign"
    | "StartSignDatacap"
    | "Granted"
    | "TotalDatacapReached"
    | "Error";
  "Validated At": string;
  "Validated By": string;
  Active: boolean;
  "Updated At": string;
  "Active Request ID": string | null;
  "On Chain Address": string;
  "Multisig Address": string;
}

export interface AllocationRequest {
  ID: string;
  "Request Type": "First" | "Refill";
  "Created At": string;
  "Updated At": string;
  Active: boolean;
  "Allocation Amount": string;
  Signers: Signer[];
}

export interface Signer {
  "Message CID": string;
  "Signing Address": string;
  "Created At": string;
  "Github Username": string;
}

export interface Allocator {
  id: number;
  owner: string;
  repo: string;
  installation_id: number;
  multisig_address: string;
  verifiers_gh_handles: string;
}

export interface RequestAllocatorsReturn {
  success: boolean;
  error: string;
  data: Allocator[];
}

export interface RequestApplicationsReturn {
  success: boolean;
  error: string;
  data: Application[];
}

export interface RequestApplicationReturn {
  success: boolean;
  error: string;
  application: Application | null;
}

export interface RequestAllowanceReturn {
  success: boolean;
  error: string;
}

export interface RequestPostApplicationTotalDCReached {
  success: boolean;
  error: string;
  data: string;
}

export interface DatacapApplicationRefillRequest {
  applicationId: string;
  amount: string;
  amountType: string;
}

export interface CheckApplicationReturn {
  totalDCReached: boolean;
  newAllocationNeeded: boolean;
  amount?: string;
}
