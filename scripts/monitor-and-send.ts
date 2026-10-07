// scripts/monitor-and-send.ts
// Revisa bóvedas activadas y envía correo a herederos.

import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SucesionSegura } from "../target/types/sucesion_segura";
import sgMail from "@sendgrid/mail";
import * as dotenv from "dotenv";
import * as fs from "fs";

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

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

const correosEnviados = new Set<string>();
const INTERVALO_MS = 5 * 60 * 1000;

async function revisarYEnviar() {
  try {
    console.log(`\n[${new Date().toISOString()}] Revisando bóvedas activadas...`);

    const todas = await program.account.vault.all();
    let enviados = 0;

    for (const { publicKey, account } of todas) {
      if (
        !account.isTriggered ||
        account.withdrawalClaimed ||
        correosEnviados.has(publicKey.toBase58())
      ) {
        continue;
      }

      const correos = account.beneficiaryEmails;
      const dueno = account.owner.toBase58();
      const activadaEn = new Date(
        account.triggeredAt.toNumber() * 1000
      ).toISOString();
      const montoYar = account.yarLockedAmount.toString();

      const cuerpo = `
        <h2>🔐 Herencia activada — Sucesión Segura</h2>
        <p>Hola,</p>
        <p>Te contactamos porque una bóveda de herencia en la que estás
        registrado como beneficiario ha sido activada tras un período de
        inactividad del propietario.</p>

        <h3>Datos de la bóveda</h3>
        <ul>
          <li><strong>Propietario:</strong> <code>${dueno}</code></li>
          <li><strong>Dirección de la bóveda:</strong> <code>${publicKey.toBase58()}</code></li>
          <li><strong>Fecha de activación:</strong> ${activadaEn}</li>
          <li><strong>Garantía YAR bloqueada:</strong> ${montoYar}</li>
        </ul>

        <h3>Cómo reclamar</h3>
        <p>Los 2 beneficiarios deben firmar juntos la instrucción
        <code>claimInheritance</code> con sus wallets. El contrato repartirá
        los fondos 50/50 entre los 2 beneficiarios registrados.</p>

        <hr>
        <p style="color:#888;font-size:12px;">
          Este es un correo automático. No respondas a este mensaje.
        </p>
      `;

      try {
        await sgMail.send({
          to: correos,
          from: process.env.SENDGRID_FROM!,
          subject: "🔐 Herencia activada — Sucesión Segura",
          html: cuerpo,
        });
        correosEnviados.add(publicKey.toBase58());
        console.log(
          `   ✅ Correo enviado para ${publicKey.toBase58()} → ${correos.join(", ")}`
        );
        enviados++;
      } catch (err: any) {
        console.error(
          `   ❌ Error enviando correo para ${publicKey.toBase58()}: ${err.message}`
        );
      }
    }

    console.log(`   Correos enviados: ${enviados}`);
  } catch (err) {
    console.error("❌ Error general en el monitor:", err);
  }
}

revisarYEnviar();
setInterval(revisarYEnviar, INTERVALO_MS);

console.log("📧 Monitor de correos activo. Revisando cada 5 minutos...");
console.log("   (Ctrl+C para detener)");
