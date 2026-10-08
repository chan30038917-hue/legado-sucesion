import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SucesionSegura } from "../target/types/sucesion_segura";
import { assert } from "chai";
import * as fs from "fs";

describe("sucesion_segura - Herencia 2-de-3 con pausa y comisión", () => {
  const walletPath = `${process.env.HOME}/.config/solana/id.json`;
  const walletKeypair = anchor.web3.Keypair.fromSecretKey(
    Uint8Array.from(JSON.parse(fs.readFileSync(walletPath, "utf-8")))
  );

  const connection = new anchor.web3.Connection(
    "http://127.0.0.1:8899",
    "confirmed"
  );

  const provider = new anchor.AnchorProvider(
    connection,
    new anchor.Wallet(walletKeypair),
    { commitment: "confirmed" }
  );
  anchor.setProvider(provider);

  const program = anchor.workspace.SucesionSegura as Program<SucesionSegura>;
  const owner = provider.wallet;

  const beneficiary1 = anchor.web3.Keypair.generate();
  const beneficiary2 = anchor.web3.Keypair.generate();

  const feeWallet = new anchor.web3.PublicKey(
    "Fng4pr8QMJf6idx1frCVA2n19rocRTrXmXKfKj9dApm6"
  );

  let vaultPda: anchor.web3.PublicKey;
  let solVaultPda: anchor.web3.PublicKey;

  const inactivityPeriod = new anchor.BN(5);
  const beneficiaryEmails = [
    "heredero1@example.com",
    "heredero2@example.com",
  ];
  const guaranteeLamports = new anchor.BN(50_000_000);

  before(async () => {
    for (const b of [beneficiary1, beneficiary2]) {
      const sig = await provider.connection.requestAirdrop(
        b.publicKey,
        100_000_000
      );
      await provider.connection.confirmTransaction(sig);
    }

    [vaultPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), owner.publicKey.toBuffer()],
      program.programId
    );

    [solVaultPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("sol_vault"), owner.publicKey.toBuffer()],
      program.programId
    );
  });

  it("1. Inicializa la bóveda y cobra la comisión", async () => {
    await program.methods
      .initializeVault(inactivityPeriod, beneficiaryEmails, guaranteeLamports)
      .accounts({
        owner: owner.publicKey,
        vault: vaultPda,
        solVault: solVaultPda,
        feeWallet: feeWallet,
        beneficiary1: beneficiary1.publicKey,
        beneficiary2: beneficiary2.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const vaultAccount = await program.account.vault.fetch(vaultPda);
    assert.equal(vaultAccount.owner.toBase58(), owner.publicKey.toBase58());
    assert.equal(vaultAccount.isTriggered, false);
    assert.equal(vaultAccount.paused, false);
    assert.equal(vaultAccount.beneficiaryPubkeys.length, 2);

    const solVaultBalance = await provider.connection.getBalance(solVaultPda);
    assert.isTrue(
      solVaultBalance >= 50_000_000,
      "La PDA sol_vault debe tener al menos la garantía (0.05 SOL)"
    );

    console.log(`✅ Bóveda creada. Garantía en PDA: ${solVaultBalance / 1e9} SOL`);
  });

  it("2. Ping del owner reinicia el timer", async () => {
    await program.methods
      .ping()
      .accounts({ owner: owner.publicKey, vault: vaultPda })
      .rpc();

    const vaultAccount = await program.account.vault.fetch(vaultPda);
    assert.isTrue(vaultAccount.lastActive.toNumber() > 0);
    console.log("✅ Timer reiniciado.");
  });

  it("3. Pausa la bóveda por 1 día", async () => {
    await program.methods
      .pauseInheritance(new anchor.BN(1))
      .accounts({ owner: owner.publicKey, vault: vaultPda })
      .rpc();

    const vaultAccount = await program.account.vault.fetch(vaultPda);
    assert.equal(vaultAccount.paused, true);
    assert.isTrue(vaultAccount.pausedAt.toNumber() > 0);
    assert.equal(vaultAccount.maxPauseDuration.toNumber(), 86400);
    console.log("✅ Bóveda pausada por 1 día.");
  });

  it("4. Trigger falla porque está pausada", async () => {
    await new Promise((r) => setTimeout(r, 6000));

    try {
      await program.methods
        .triggerInheritance()
        .accounts({
          caller: owner.publicKey,
          owner: owner.publicKey,
          vault: vaultPda,
        })
        .rpc();
      assert.fail("Debería fallar porque sigue pausada");
    } catch (err: any) {
      assert.include(err.error.errorMessage, "La bóveda sigue en pausa");
      console.log("✅ Bloqueado correctamente: sigue en pausa.");
    }
  });

  it("5. Reanuda y el timer se reinicia", async () => {
    await program.methods
      .resumeInheritance()
      .accounts({ owner: owner.publicKey, vault: vaultPda })
      .rpc();

    const vaultAccount = await program.account.vault.fetch(vaultPda);
    assert.equal(vaultAccount.paused, false);
    assert.equal(vaultAccount.pausedAt.toNumber(), 0);
    assert.equal(vaultAccount.maxPauseDuration.toNumber(), 0);
    console.log("✅ Bóveda reanudada.");
  });

  it("6. Trigger falla tras reanudar (aún no expira)", async () => {
    try {
      await program.methods
        .triggerInheritance()
        .accounts({
          caller: owner.publicKey,
          owner: owner.publicKey,
          vault: vaultPda,
        })
        .rpc();
      assert.fail("Debería fallar, aún no expira");
    } catch (err: any) {
      assert.include(err.error.errorMessage, "aún no ha expirado");
      console.log("✅ No se puede activar aún.");
    }
  });

  it("7. Espera y activa la herencia (owner como caller)", async () => {
    await new Promise((r) => setTimeout(r, 6000));

    await program.methods
      .triggerInheritance()
      .accounts({
        caller: owner.publicKey,
        owner: owner.publicKey,
        vault: vaultPda,
      })
      .rpc();

    const vaultAccount = await program.account.vault.fetch(vaultPda);
    assert.isTrue(vaultAccount.isTriggered);
    console.log("✅ Herencia activada.");
  });

  it("8. Los 2 herederos reclaman (con cuenta owner)", async () => {
    await program.methods
      .claimInheritance()
      .accounts({
        beneficiary1: beneficiary1.publicKey,
        beneficiary2: beneficiary2.publicKey,
        owner: owner.publicKey,
        vault: vaultPda,
        solVault: solVaultPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([beneficiary1, beneficiary2])
      .rpc();

    const vaultAccount = await program.account.vault.fetch(vaultPda);
    assert.isTrue(vaultAccount.withdrawalClaimed);
    console.log("✅ Herencia reclamada.");
  });
});
