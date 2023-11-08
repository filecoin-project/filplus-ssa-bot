export const newAllocationRequestComment = (
  address: string,
  amountToRequest: string,
  msigAddress: string,
  requestNumber: number,
  uuid: string,
): string => {
  // #### Remaining dataCap\r> ${dataCapRemaining}\r
  return `
## DataCap Allocation requested\r\n
### Request number ${requestNumber}
#### Multisig Notary address\r\n> ${msigAddress}\r\n
#### Client address\r\n> ${address}\r\n
#### DataCap allocation requested\r\n> ${amountToRequest}\r\n
#### Id\r\n> ${uuid}`;
};

export const multisigApprovalComment = (
  address: string,
  dataCap: string,
): string => {
  return `\r\n## Datacap Request For MultiSig\r\n#### Address\r\n> ${address}\r\n#### Datacap Allocated\r\n> ${dataCap}\r\n`;
};
