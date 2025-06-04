import { config } from "../config";
import { type Address, createPublicClient, http, rpcSchema } from "viem";
import { filecoin, filecoinCalibration } from "viem/chains";

type FilecoinRpcSchema = [
  {
    Method: "Filecoin.FilecoinAddressToEthAddress";
    Parameters: [string, string | null];
    ReturnType: string | null;
  },
  {
    Method: "Filecoin.EthCall";
    Parameters: [
      {
        from: string | null;
        to: string;
        data: Address;
      },
      string | number,
    ];
    ReturnType: string | null;
  },
  {
    Method: "Filecoin.StateVerifiedClientStatus";
    Parameters: [string, null];
    ReturnType: string | null;
  },
];

export interface IFilecoinClient {
  filecoinAddressToEthAddress: (address: string) => Promise<string | null>;
  staticCall: (
    params: { from: string | null; to: string; data: Address },
    blockNumber: string | number,
  ) => Promise<string | null>;
  verifiedClientStatus: (address: string) => Promise<string | null>;
}

export class FilecoinClient implements IFilecoinClient {
  private readonly client;

  constructor() {
    this.client = createPublicClient({
      chain:
        config.networkType === "production" ? filecoin : filecoinCalibration,
      rpcSchema: rpcSchema<FilecoinRpcSchema>(),
      transport: http(config?.glifApi),
    });
  }

  public async filecoinAddressToEthAddress(
    address: string,
  ): Promise<Address | null> {
    const status: Address = await this.client.request({
      method: "Filecoin.FilecoinAddressToEthAddress",
      params: [address, null],
    });

    return status;
  }

  public async staticCall(
    params: { from: string | null; to: string; data: Address },
    blockNumber: string | number,
  ): Promise<string | null> {
    const status: string = await this.client.request({
      method: "Filecoin.EthCall",
      params: [params, blockNumber ?? "latest"],
    });

    return status;
  }

  public async verifiedClientStatus(address: string): Promise<string | null> {
    const status: string = await this.client.request({
      method: "Filecoin.StateVerifiedClientStatus",
      params: [address, null],
    });

    return status;
  }
}
