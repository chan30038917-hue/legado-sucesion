import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SucesionSegura } from "../target/types/sucesion_segura";
import nodemailer from "nodemailer";
import * as dotenv from "dotenv";
import * as fs from "fs";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASS,
  },
});

// Owner: wallet fija en /tmp/owner-v6.json
const ownerKeypair = anchor.web3.Keypair.fromSecretKey(
  Uint8Array.from(
    JSON.parse(fs.readFileSync("/tmp/owner-v6.json", "utf-8"))
  )
);
const ownerWallet = new anchor.Wallet(ownerKeypair);

const her1 = anchor.web3.Keypair.fromSecretKey(
  Uint8Array.from(JSON.parse(fs.readFileSync("/tmp/her1.json", "utf-8")))
);
const her2 = anchor.web3.Keypair.fromSecretKey(
  Uint8Array.from(JSON.parse(fs.readFileSync("/tmp/her2.json", "utf-8")))
);

const connection = new anchor.web3.Connection(
  "https://api.devnet.solana.com",
  "confirmed"
);

const provider = new anchor.AnchorProvider(connection, ownerWallet, {
  commitment: "confirmed",
});
anchor.setProvider(provider);

const program = anchor.workspace.SucesionSegura as Program<SucesionSegura>;

// Wallet donde se cobra la comisión (tu wallet CLI)
const FEE_WALLET = new anchor.web3.PublicKey(
  "7ioLT1Jq4FznYmv7NZx4Rq2o2Cn9rSLxD8eFKHNRfqnA"
);

async function main() {
  console.log("🚀 Prueba end-to-end de liquidación\n");

  const owner = ownerWallet.publicKey;
  console.log(`👤 Owner: ${owner.toBase58()}`);
  console.log(`👥 Heredero 1: ${her1.publicKey.toBase58()}`);
  console.log(`👥 Heredero 2: ${her2.publicKey.toBase58()}`);

  const [vaultPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), owner.toBuffer()],
    program.programId
  );
  const [solVaultPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("sol_vault"), owner.toBuffer()],
    program.programId
  );

  // Verificar si ya existe bóveda
  let vaultExists = false;
  try {
    await program.account.vault.fetch(vaultPda);
    vaultExists = true;
  } catch {
    vaultExists = false;
  }

  if (vaultExists) {
    console.log("\n⚠️  Ya existe una bóveda. Intentando cancelarla...");
    try {
      await program.methods
        .cancelVault()
        .accounts({
          owner,
          vault: vaultPda,
          solVault: solVaultPda,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();
      console.log("   ✅ Bóveda anterior cancelada.");
      await new Promise((r) => setTimeout(r, 2000));
    } catch (e: any) {
      console.log(`   ❌ No se pudo cancelar: ${e.message}`);
      console.log("   Crea una wallet nueva o usa otra.");
      process.exit(1);
    }
  }

  console.log("\n1️⃣  Creando bóveda con período de 5 segundos...");

  const inactivityPeriod = new anchor.BN(5);
  const guaranteeLamports = new anchor.BN(50_000_000); // 0.05 SOL
  const emails = [
    process.env.SENDGRID_TO_TEST!,
    process.env.SENDGRID_TO_TEST!,
  ];

  const txInit = await program.methods
    .initializeVault(inactivityPeriod, emails, guaranteeLamports)
    .accounts({
      owner,
      vault: vaultPda,
      solVault: solVaultPda,
      feeWallet: FEE_WALLET,
      beneficiary1: her1.publicKey,
      beneficiary2: her2.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    })
    .rpc();
  console.log(`   ✅ Bóveda creada. Tx: ${txInit.slice(0, 20)}...`);

  console.log("\n2️⃣  Esperando 7 segundos a que expire...");
  await new Promise((r) => setTimeout(r, 7000));

  console.log("\n3️⃣  Activando herencia...");
  const txTrigger = await program.methods
    .triggerInheritance()
    .accounts({ caller: owner, vault: vaultPda })
    .rpc();
  console.log(`   ✅ Herencia activada. Tx: ${txTrigger.slice(0, 20)}...`);

  const b1SolBefore = await connection.getBalance(her1.publicKey);
  const b2SolBefore = await connection.getBalance(her2.publicKey);

  console.log("\n📊 Saldos ANTES del claim:");
  console.log(`   Heredero 1: ${(b1SolBefore / 1e9).toFixed(6)} SOL`);
  console.log(`   Heredero 2: ${(b2SolBefore / 1e9).toFixed(6)} SOL`);

  console.log("\n4️⃣  Reclamando herencia (2 firmas)...");
  const txClaim = await program.methods
    .claimInheritance()
    .accounts({
      beneficiary1: her1.publicKey,
      beneficiary2: her2.publicKey,
      vault: vaultPda,
      solVault: solVaultPda,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .signers([her1, her2])
    .rpc();
  console.log(`   ✅ Herencia reclamada. Tx: ${txClaim.slice(0, 20)}...`);

  await new Promise((r) => setTimeout(r, 2000));

  const b1SolAfter = await connection.getBalance(her1.publicKey);
  const b2SolAfter = await connection.getBalance(her2.publicKey);

  console.log("\n📊 Saldos DESPUÉS del claim:");
  console.log(`   Heredero 1: ${(b1SolAfter / 1e9).toFixed(6)} SOL`);
  console.log(`   Heredero 2: ${(b2SolAfter / 1e9).toFixed(6)} SOL`);

  console.log("\n💸 Deltas:");
  console.log(
    `   Heredero 1: +${((b1SolAfter - b1SolBefore) / 1e9).toFixed(6)} SOL`
  );
  console.log(
    `   Heredero 2: +${((b2SolAfter - b2SolBefore) / 1e9).toFixed(6)} SOL`
  );

  console.log("\n5️⃣  Enviando correo...");

  const vaultInfo = await program.account.vault.fetch(vaultPda);
  const activadaEn = new Date(
    vaultInfo.triggeredAt.toNumber() * 1000
  ).toISOString();

  const cuerpo = `
    <h2>🔐 Herencia activada — Legado</h2>
    <p>Hola,</p>
    <p>Te contactamos porque una bóveda de herencia en la que estás registrado como beneficiario ha sido activada tras un período de inactividad del propietario.</p>

    <h3>Datos de la bóveda</h3>
    <ul>
      <li><strong>Propietario:</strong> <code>${owner.toBase58()}</code></li>
      <li><strong>Dirección de la bóveda:</strong> <code>${vaultPda.toBase58()}</code></li>
      <li><strong>Fecha de activación:</strong> ${activadaEn}</li>
      <li><strong>Garantía en SOL:</strong> ${vaultInfo.guaranteeLamports.toString()} lamports</li>
    </ul>

    <h3>Cómo reclamar</h3>
    <p>Los beneficiarios deben firmar juntos la instrucción <code>claimInheritance</code> con sus wallets. El contrato repartirá los fondos 50/50.</p>

    <hr>
    <p style="color:#888;font-size:12px;">Este es un correo automático. No respondas a este mensaje.</p>
  `;

  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: emails.join(", "),
    subject: "🔐 Herencia activada — Legado",
    html: cuerpo,
  });

  console.log(`   ✅ Correo enviado a ${emails.join(", ")}`);
  console.log("\n🎉 Prueba end-to-end completada.\n");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Error:", err);
    process.exit(1);
  });
