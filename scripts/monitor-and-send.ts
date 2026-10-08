// scripts/monitor-and-send.ts
// Revisa bóvedas activadas y envía correo a herederos usando Gmail (Nodemailer).

import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SucesionSegura } from "../target/types/sucesion_segura";
import nodemailer from "nodemailer";
import * as dotenv from "dotenv";
import * as fs from "fs";

dotenv.config();

// ---- Configuración de Gmail ----
const GMAIL_USER = process.env.GMAIL_USER!;
const GMAIL_APP_PASS = process.env.GMAIL_APP_PASS!;

if (!GMAIL_USER || !GMAIL_APP_PASS) {
  console.error("❌ Falta GMAIL_USER o GMAIL_APP_PASS en el .env");
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_APP_PASS,
  },
});

// ---- Configuración de Solana ----
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
      // Campo correcto del contrato:
      const garantiaSol = account.guaranteeLamports.toNumber() / 1e9;

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
          <li><strong>Garantía bloqueada:</strong> ${garantiaSol} SOL</li>
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
        await transporter.sendMail({
          from: GMAIL_USER,
          to: correos.join(","),
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

// Si se llama con --test, envía un correo de prueba y sale.
if (process.argv.includes("--test")) {
  (async () => {
    try {
      console.log("📧 Enviando correo de prueba...");
      await transporter.sendMail({
        from: GMAIL_USER,
        to: process.env.SENDGRID_TO_TEST || GMAIL_USER,
        subject: "✅ Prueba — Monitor de Legado",
        html: "<h2>Funciona 🎉</h2><p>El envío de correos con Gmail está OK.</p>",
      });
      console.log("✅ Correo de prueba enviado correctamente.");
      process.exit(0);
    } catch (err: any) {
      console.error("❌ Falló el envío:", err.message);
      process.exit(1);
    }
  })();
} else {
  revisarYEnviar();
  setInterval(revisarYEnviar, INTERVALO_MS);

  console.log("📧 Monitor de correos activo. Revisando cada 5 minutos...");
  console.log("   (Ctrl+C para detener)");
}
