// scripts/test-e2e.ts
// Prueba end-to-end: crea bóveda, la expira, activa trigger, envía correo.

import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SucesionSegura } from "../target/types/sucesion_segura";
import {
  TOKEN_PROGRAM_ID,
  createMint,
  createAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";
import sgMail from "@sendgrid/mail";
import * as dotenv from "dotenv";
import * as fs from "fs";

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

// Wallet y provider manual (no depende de AnchorProvider.env)
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

const beneficiary1 = anchor.web3.Keypair.generate();
const beneficiary2 = anchor.web3.Keypair.generate();

async function main() {
  console.log("🚀 Iniciando prueba end-to-end...\n");

  // 1. Fondear herederos
  for (const b of [beneficiary1, beneficiary2]) {
    const sig = await provider.connection.requestAirdrop(
      b.publicKey,
      100_000_000
    );
    await provider.connection.confirmTransaction(sig);
  }
  console.log("✅ Herederos fondeados.");

  // 2. Crear mint YAR
  const yarMint = await createMint(
    provider.connection,
    (wallet as anchor.Wallet).payer,
    wallet.publicKey,
    null,
    6
  );
  console.log(`✅ Mint YAR: ${yarMint.toBase58()}`);

  // 3. ATA del owner + mint
  const userYar = await createAssociatedTokenAccount(
    provider.connection,
    (wallet as anchor.Wallet).payer,
    yarMint,
    wallet.publicKey
  );
  await mintTo(
    provider.connection,
    (wallet as anchor.Wallet).payer,
    yarMint,
    userYar,
    wallet.publicKey,
    100_000_000
  );
  console.log("✅ 100 YAR acuñados al owner.");

  // 4. PDAs
  const [vaultPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), wallet.publicKey.toBuffer()],
    program.programId
  );
  const [tokenVault] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("token_vault"), wallet.publicKey.toBuffer()],
    program.programId
  );

  // 5. Inicializar bóveda
  const inactivityPeriod = new anchor.BN(5);
  const yarAmount = new anchor.BN(10_000_000);
  const emails = [
    process.env.SENDGRID_TO_TEST!,
    process.env.SENDGRID_TO_TEST!,
  ];

  const initTx = await program.methods
    .initializeVault(inactivityPeriod, emails, yarAmount)
    .accounts({
      owner: wallet.publicKey,
      vault: vaultPda,
      userYarAccount: userYar,
      tokenVault: tokenVault,
      yarMint: yarMint,
      beneficiary1: beneficiary1.publicKey,
      beneficiary2: beneficiary2.publicKey,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    })
    .rpc();
  console.log(`✅ Bóveda creada. Tx: ${initTx}`);

  // 6. Esperar a que expire
  console.log("⏳ Esperando 6 segundos a que expire...");
  await new Promise((r) => setTimeout(r, 6000));

  // 7. Activar herencia
  const triggerTx = await program.methods
    .triggerInheritance()
    .accounts({
      caller: wallet.publicKey,
      vault: vaultPda,
    })
    .rpc();
  console.log(`✅ Herencia activada. Tx: ${triggerTx}`);

  // 8. Enviar correo de prueba
  console.log("📧 Enviando correo de prueba...");
  await sgMail.send({
    to: process.env.SENDGRID_TO_TEST!,
    from: process.env.SENDGRID_FROM!,
    subject: "🧪 Prueba E2E — Sucesión Segura",
    html: `
      <h2>Prueba end-to-end exitosa</h2>
      <p>Se creó una bóveda, se activó la herencia y este correo confirma
      que el backend funciona correctamente.</p>
      <ul>
        <li>Bóveda: <code>${vaultPda.toBase58()}</code></li>
        <li>Propietario: <code>${wallet.publicKey.toBase58()}</code></li>
        <li>Heredero 1: <code>${beneficiary1.publicKey.toBase58()}</code></li>
        <li>Heredero 2: <code>${beneficiary2.publicKey.toBase58()}</code></li>
      </ul>
    `,
  });
  console.log("✅ Correo enviado.");
  console.log("\n🎉 Prueba end-to-end completada.");
  console.log(`   Revisa la bandeja de ${process.env.SENDGRID_TO_TEST}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Error:", err);
    process.exit(1);
  });
