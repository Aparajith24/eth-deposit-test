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
import { Button } from "@/components/ui/button";

const TELEGRAM_BOT_TOKEN = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
const CHAT_ID = "@ethluga";

export default function Home() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastProcessedBlock, setLastProcessedBlock] = useState<number | null>(
    null,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const depositsPerPage = 10;

  const paginatedDeposits = deposits.slice(
    (currentPage - 1) * depositsPerPage,
    currentPage * depositsPerPage,
  );

  // Fetch deposits from Ethereum blockchain every 15 seconds
  useEffect(() => {
    async function fetchDeposits() {
      setLoading(true);
      setError(null);
      try {
        const latestBlock = await getLatestBlockNumber();
        const startBlock = lastProcessedBlock
          ? lastProcessedBlock + 1
          : latestBlock - 1000;
        const endBlock = latestBlock;
        if (startBlock > endBlock) {
          setLoading(false);
          return;
        }
        const newDeposits = await getDeposits(startBlock, endBlock);
        setDeposits((prevDeposits) => {
          const existingHashes = new Set(prevDeposits.map((d) => d.hash));
          const uniqueDeposits = newDeposits.filter(
            (d) => !existingHashes.has(d.hash),
          );

          // Send Telegram messages for new deposits
          const sendMessages = uniqueDeposits.map(async (deposit) => {
            const message = `New deposit detected!\nBlock: ${deposit.blockNumber}\nAmount: ${ethers.utils.formatEther(deposit.amount)} ETH\nSender: ${deposit.senderAddress}\nHash: ${deposit.hash}`;
            await fetch(
              `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=@ethluga&text=${message}`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  chat_id: CHAT_ID,
                  text: message,
                }),
              },
            );
          });

          // Wait for all messages to be sent
          Promise.all(sendMessages).catch((error) => {
            console.error("Error sending messages:", error);
          });
          return [...prevDeposits, ...uniqueDeposits];
        });
        setLastProcessedBlock(endBlock);
      } catch (error) {
        console.error("Error fetching deposits:", error);
        setError("Failed to fetch deposits. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchDeposits();
    const interval = setInterval(fetchDeposits, 15000);
    return () => clearInterval(interval);
  }, [lastProcessedBlock]);

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
      <div className="mt-5 flex justify-center border-b">
        <h1 className="text-3xl font-extrabold mb-4">
          Ethereum Deposit Tracker
        </h1>
      </div>

      {loading ? (
        <div className="mt-5 flex justify-center">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      ) : (
        <div>
          {paginatedDeposits.length === 0 ? (
            <div className="mt-5 flex justify-center">
              <p className="text-lg">No deposits found.</p>
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
                  {paginatedDeposits.map((deposit, index) => (
                    <TableRow key={index}>
                      <TableCell>{deposit.blockNumber}</TableCell>
                      <TableCell>
                        {new Date(
                          deposit.blockTimestamp * 1000,
                        ).toLocaleString()}
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
                      <TableCell className="break-all">
                        {deposit.hash}
                      </TableCell>
                      <TableCell className="break-all">
                        {deposit.pubkey}
                      </TableCell>
                      <TableCell>
                        {ethers.utils.formatEther(deposit.gasUsed)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}

      <div className="mt-5 flex justify-center">
        <Button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="mr-3"
        >
          Previous
        </Button>
        <Button
          onClick={() =>
            setCurrentPage((prev) =>
              deposits.length > prev * depositsPerPage ? prev + 1 : prev,
            )
          }
          disabled={deposits.length <= currentPage * depositsPerPage}
        >
          Next
        </Button>
      </div>
    </>
  );
}
