import { AnchorProvider, Program, Idl } from "@coral-xyz/anchor";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { useMemo } from "react";
import { PublicKey } from "@solana/web3.js";
import idlJson from "./idl.json";
import { PROGRAM_ID } from "./network";

// Manejar tanto import ES module como JSON plano
const idl = ((idlJson as any).default || idlJson) as Idl;

export function useProgram() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  return useMemo(() => {
    if (!wallet) return null;
    const provider = new AnchorProvider(connection, wallet, {
      commitment: "confirmed",
    });
    return new Program(idl, PROGRAM_ID, provider);
  }, [connection, wallet]);
}

export function getVaultPDA(owner: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), owner.toBuffer()],
    PROGRAM_ID
  );
}

export function getTokenVaultPDA(owner: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("token_vault"), owner.toBuffer()],
    PROGRAM_ID
  );
}
