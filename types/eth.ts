import { ethers } from "ethers";

export interface Deposit {
  blockNumber: number;
  blockTimestamp: number;
  fee: ethers.BigNumber;
  hash: string;
  pubkey: string;
  amount: ethers.BigNumber;
  senderAddress: string;
  gasUsed: ethers.BigNumber;
}
