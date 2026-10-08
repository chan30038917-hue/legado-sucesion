import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";

export const NETWORK = "devnet" as const;

export const RPC_ENDPOINT =
  NETWORK === "devnet"
    ? clusterApiUrl("devnet")
    : clusterApiUrl("mainnet-beta");

export const connection = new Connection(RPC_ENDPOINT, "confirmed");

export const PROGRAM_ID = new PublicKey(
  "2yNo3xJD5Qj1HYiAZZ4tKYgRp5HwLt2VXHjzckETMpYG"
);
