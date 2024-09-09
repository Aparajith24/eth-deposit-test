import { NextResponse } from "next/server";
import { getLatestBlockNumber, getDeposits } from "../../../utils/ethereum";

export async function GET() {
  try {
    console.log("Fetching latest block number...");
    const latestBlock = await getLatestBlockNumber();
    console.log("Latest block number:", latestBlock);

    console.log("Fetching deposits...");
    const deposits = await getDeposits(latestBlock - 500, latestBlock);
    console.log("Deposits fetched successfully");

    return NextResponse.json(deposits);
  } catch (error: any) {
    console.error("Error in API route:", error);
    return NextResponse.json(
      { error: "Failed to fetch deposits", details: error.message },
      { status: 500 },
    );
  }
}
