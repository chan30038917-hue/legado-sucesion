// scripts/crank-trigger.ts
// Revisa bóvedas y activa la herencia si el período ya expiró.

import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SucesionSegura } from "../target/types/sucesion_segura";
import * as dotenv from "dotenv";
import * as fs from "fs";

dotenv.config();

const walletPath =
  process.env.ANCHOR_WALLET || `${process.env.HOME}/.config/solana/id.json`;
const walletKeypair = anchor.web3.Keypair.fromSecretKey(
  Uint8Array.from(JSON.parse(fs.readFileSync(walletPath, "utf-8")))
);
const wallet = new anchor.Wallet(walletKeypair);

const connection = new anchor.web3.Connection(
  process.env.SOLANA_RPC || "http://127.0.0.1:8899",
  "confirmed"
);

const provider = new anchor.AnchorProvider(connection, wallet, {
  commitment: "confirmed",
});
anchor.setProvider(provider);

const program = anchor.workspace.SucesionSegura as Program<SucesionSegura>;

const INTERVALO_MS = 60 * 60 * 1000;

async function revisarYActivar() {
  try {
    console.log(`\n[${new Date().toISOString()}] Revisando bóvedas...`);

    const todas = await program.account.vault.all();
    console.log(`   Encontradas ${todas.length} bóveda(s).`);

    let activadas = 0;

    for (const { publicKey, account } of todas) {
      if (account.isTriggered) continue;

      const ahora = Math.floor(Date.now() / 1000);
      const expira =
        account.lastActive.toNumber() + account.inactivityPeriod.toNumber();

      if (ahora >= expira) {
        console.log(`   Activando bóveda ${publicKey.toBase58()}...`);
        try {
          const tx = await program.methods
            .triggerInheritance()
            .accounts({
              caller: wallet.publicKey,
              vault: publicKey,
            })
            .rpc();
          console.log(`   ✅ Activada. Tx: ${tx}`);
          activadas++;
        } catch (err: any) {
          console.error(
            `   ❌ Error activando ${publicKey.toBase58()}: ${err.message}`
          );
        }
      }
    }

    console.log(`   Total activadas: ${activadas}`);
  } catch (err) {
    console.error("❌ Error general en el crank:", err);
  }
}

revisarYActivar();
setInterval(revisarYActivar, INTERVALO_MS);

console.log("⏰ Crank activo. Revisando cada hora...");
console.log("   (Ctrl+C para detener)");
