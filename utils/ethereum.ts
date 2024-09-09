import { Alchemy, Network } from "alchemy-sdk";
import { ethers } from "ethers";
import { Deposit } from "../types/eth";

const settings = {
  apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
};

//setting up alchemy
const alchemy = new Alchemy(settings);
const beaconDepositContract = process.env.NEXT_PUBLIC_BEACON_DEPOSIT_CONTRACT;

export async function getLatestBlockNumber(): Promise<number> {
  return await alchemy.core.getBlockNumber();
}

//function to get the transactions
export async function getDeposits(
  fromBlock: number,
  toBlock: number,
): Promise<Deposit[]> {
  const deposits: Deposit[] = [];
  const events = await alchemy.core.getLogs({
    fromBlock,
    toBlock,
    address: beaconDepositContract,
  });

  for (const event of events) {
    const tx = await alchemy.core.getTransaction(event.transactionHash);
    const receipt = await alchemy.core.getTransactionReceipt(
      event.transactionHash,
    );
    const block = await alchemy.core.getBlock(event.blockNumber);

    //checking if the transaction, block and receipt are not null
    if (tx && block && receipt) {
      const inputData = tx.data;
      const depositsInTransaction = decodeDepositData(inputData);
      for (const depositData of depositsInTransaction) {
        const deposit: Deposit = {
          blockNumber: event.blockNumber,
          blockTimestamp: block.timestamp,
          fee: tx.gasPrice?.mul(tx.gasLimit) || ethers.BigNumber.from(0),
          hash: event.transactionHash,
          pubkey: "0x" + event.data.slice(2, 98),
          amount: depositData.amount,
          senderAddress: tx.from,
          gasUsed: receipt.gasUsed,
        };

        deposits.push(deposit);
      }
    }
  }
  console.log("Deposits:", deposits);
  return deposits;
}

function decodeDepositData(inputData: string): { amount: ethers.BigNumber }[] {
  return [{ amount: ethers.BigNumber.from(0) }];
}
