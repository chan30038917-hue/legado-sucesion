import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";

export const NETWORK = "devnet" as const;

export const RPC_ENDPOINT =
  NETWORK === "devnet"
    ? clusterApiUrl("devnet")
    : clusterApiUrl("mainnet-beta");

export const connection = new Connection(RPC_ENDPOINT, "confirmed");

export const PROGRAM_ID = new PublicKey(
  "CuNU2U9vp7EhZLwYkDiCkbCLHxSsHKmgbC59ajbe1haB"
);
