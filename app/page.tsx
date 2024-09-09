"use client";

import { useState, useEffect } from "react";
import { getLatestBlockNumber, getDeposits } from "../utils/ethereum";
import { ethers } from "ethers";
import { Deposit } from "../types/eth";
import { Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Home() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch deposits every 15 seconds
  useEffect(() => {
    async function fetchDeposits() {
      try {
        const latestBlock = await getLatestBlockNumber();
        const newDeposits = await getDeposits(latestBlock - 200, latestBlock);
        setDeposits(newDeposits);
      } catch (error) {
        console.error("Error fetching deposits:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDeposits();
    const interval = setInterval(fetchDeposits, 15000);

    return () => clearInterval(interval);
  }, []);

  // Save deposits to MongoDB everytime the deposits state changes
  useEffect(() => {
    async function saveData() {
      try {
        const response = await fetch("http://localhost:3000/api/mongo", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(deposits),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        console.log("Data saved:", result);
      } catch (error) {
        console.error("Error saving data:", error);
      }
    }
    if (deposits.length > 0) {
      saveData();
    }
  }, [deposits]);

  return (
    <>
      <div className="mt-5 flex span justify-center border-b">
        <h1 className="text-3xl font-extrabold mb-4 ">
          Ethereum Deposit Tracker
        </h1>
      </div>
      {loading ? (
        <div className="mt-5 flex span justify-center">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      ) : (
        <div className="mt-5 rounded-md border ml-5 mr-5">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Block</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Fee</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Sender</TableHead>
                <TableHead>Hash</TableHead>
                <TableHead>Pubkey</TableHead>
                <TableHead>Gas Used</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deposits.map((deposit, index) => (
                <TableRow key={index}>
                  <TableCell>{deposit.blockNumber}</TableCell>
                  <TableCell>
                    {new Date(deposit.blockTimestamp * 1000).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {ethers.utils.formatEther(deposit.fee)} ETH
                  </TableCell>
                  <TableCell>
                    {ethers.utils.formatEther(deposit.amount)} ETH
                  </TableCell>
                  <TableCell className="break-all">
                    {deposit.senderAddress}
                  </TableCell>
                  <TableCell className="break-all">{deposit.hash}</TableCell>
                  <TableCell className="break-all">{deposit.pubkey}</TableCell>
                  <TableCell>
                    {ethers.utils.formatEther(deposit.gasUsed)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}
