"use client";

import { useState } from "react";
import Link from "next/link";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProgram, getVaultPDA } from "@/lib/program";
import {
  Gift,
  AlertCircle,
  CheckCircle2,
  Users,
  Home,
  ArrowRight,
  Coins,
} from "lucide-react";

export default function ClaimPage() {
  const { connected, publicKey } = useWallet();
  const { connection } = useConnection();
  const program = useProgram();

  const [ownerAddress, setOwnerAddress] = useState("");
  const [beneficiary2Address, setBeneficiary2Address] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [vaultInfo, setVaultInfo] = useState<any>(null);
  const [checking, setChecking] = useState(false);

  async function checkVault() {
    if (!program || !ownerAddress) return;
    setChecking(true);
    setError(null);
    setVaultInfo(null);
    try {
      const ownerPubkey = new PublicKey(ownerAddress);
      const [vaultPda] = getVaultPDA(ownerPubkey);
      const vaultAccount = await program.account.vault.fetch(vaultPda);
      setVaultInfo({ ...vaultAccount, pubkey: vaultPda, ownerPubkey });
    } catch (err: any) {
      setError(
        "No encontramos ninguna bóveda asociada a esa dirección. Verifica que sea correcta."
      );
    } finally {
      setChecking(false);
    }
  }

  async function handleClaim() {
    if (!program || !publicKey || !vaultInfo || !beneficiary2Address) {
      setError("Rellena todos los campos primero.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const ownerPubkey = vaultInfo.ownerPubkey;
      const [vaultPda] = getVaultPDA(ownerPubkey);
      const [solVaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("sol_vault"), ownerPubkey.toBuffer()],
        program.programId
      );

      const b1 = vaultInfo.beneficiaryPubkeys[0].toBase58();
      const b2 = vaultInfo.beneficiaryPubkeys[1].toBase58();
      const me = publicKey.toBase58();

      if (me !== b1 && me !== b2) {
        throw new Error(
          "Tu billetera no es uno de los herederos registrados en esta bóveda."
        );
      }

      const otherAddress = me === b1 ? b2 : b1;
      if (beneficiary2Address !== otherAddress) {
        throw new Error(
          `El segundo heredero debe ser ${otherAddress}. Verifica la dirección.`
        );
      }

      const tx = await program.methods
        .claimInheritance()
        .accounts({
          beneficiary1: vaultInfo.beneficiaryPubkeys[0],
          beneficiary2: vaultInfo.beneficiaryPubkeys[1],
          vault: vaultPda,
          solVault: solVaultPda,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .transaction();

      const signed = await (window as any).solana.signTransaction(tx);
      const sig = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(sig, "confirmed");

      setSuccess(`Herencia reclamada. Tx: ${sig.slice(0, 20)}...`);
    } catch (err: any) {
      console.error(err);
      setError(
        err.message ||
          "Error al reclamar. Asegúrate de que ambos herederos firmen."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <Header />

      <div className="container mx-auto max-w-3xl px-4 py-12 md:px-8">
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-sm text-muted-foreground">
            <Gift className="h-4 w-4 text-primary" />
            <span>Para herederos</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Reclamar herencia
          </h1>
          <p className="mt-2 text-muted-foreground">
            Si recibiste un correo avisándote de que una bóveda se activó,
            estás en el lugar correcto.
          </p>
        </div>

        {!vaultInfo && (
          <Card>
            <CardContent className="p-6 md:p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">
                    Encuentra la bóveda
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Introduce la dirección del dueño (la que aparece en el
                    correo)
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="owner">Dirección del dueño</Label>
                  <Input
                    id="owner"
                    value={ownerAddress}
                    onChange={(e) => setOwnerAddress(e.target.value)}
                    placeholder="Ej: Fng4pr8QMJf6idx...Apm6"
                    className="mt-2"
                  />
                </div>

                {error && (
                  <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <Button
                  onClick={checkVault}
                  disabled={checking || !ownerAddress || !connected}
                  className="w-full"
                >
                  {checking ? "Buscando..." : "Buscar bóveda"}
                  {!checking && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>

                {!connected && (
                  <p className="text-center text-sm text-muted-foreground">
                    Conecta tu billetera primero
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {vaultInfo && (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 md:p-8">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Bóveda encontrada
                    </div>
                    <div className="mt-1 font-mono text-sm">
                      {vaultInfo.pubkey.toBase58().slice(0, 12)}...
                      {vaultInfo.pubkey.toBase58().slice(-6)}
                    </div>
                  </div>
                  <div
                    className={`rounded-full px-3 py-1 text-sm font-medium ${
                      vaultInfo.isTriggered
                        ? "bg-green-100 text-green-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {vaultInfo.isTriggered
                      ? "✅ Activada"
                      : "⏳ Aún no activada"}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg bg-secondary/50 p-4">
                    <div className="text-xs text-muted-foreground">
                      Garantía en SOL
                    </div>
                    <div className="mt-1 text-2xl font-bold">
                      {(
                        (vaultInfo.guaranteeLamports
                          ? vaultInfo.guaranteeLamports.toNumber()
                          : 0) / 1_000_000_000
                      ).toFixed(4)}
                    </div>
                  </div>
                  <div className="rounded-lg bg-secondary/50 p-4">
                    <div className="text-xs text-muted-foreground">
                      Estado
                    </div>
                    <div className="mt-1 text-sm font-medium">
                      {vaultInfo.withdrawalClaimed
                        ? "Ya reclamada"
                        : vaultInfo.isTriggered
                        ? "Lista para reclamar"
                        : "Esperando activación"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {vaultInfo.isTriggered && !vaultInfo.withdrawalClaimed && (
              <Card>
                <CardContent className="p-6 md:p-8">
                  <h3 className="mb-4 text-lg font-semibold">
                    🔐 Firma con ambos herederos
                  </h3>
                  <p className="mb-6 text-sm text-muted-foreground">
                    Por seguridad, los dos herederos deben firmar juntos la
                    transacción.
                  </p>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="b2">
                        Dirección del segundo heredero
                      </Label>
                      <Input
                        id="b2"
                        value={beneficiary2Address}
                        onChange={(e) =>
                          setBeneficiary2Address(e.target.value)
                        }
                        placeholder="Dirección del otro heredero"
                        className="mt-2"
                      />
                    </div>

                    <div className="rounded-lg border border-blue-500/30 bg-blue-50 p-4 text-sm text-blue-900">
                      <div className="mb-1 font-medium">ℹ️ Cómo funciona</div>
                      <p>
                        El heredero conectado firma primero. Después, cambia a
                        la segunda cuenta en Phantom y firma de nuevo.
                      </p>
                    </div>

                    {error && (
                      <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                        <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    {success && (
                      <div className="flex items-start gap-3 rounded-lg border border-green-500/30 bg-green-50 p-4 text-sm text-green-800">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
                        <span>{success}</span>
                      </div>
                    )}

                    <Button
                      onClick={handleClaim}
                      disabled={loading}
                      className="w-full"
                      size="lg"
                    >
                      <Coins className="mr-2 h-5 w-5" />
                      {loading ? "Reclamando..." : "Reclamar herencia"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {vaultInfo.withdrawalClaimed && (
              <Card>
                <CardContent className="p-6 md:p-8 text-center">
                  <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-green-600" />
                  <h3 className="text-xl font-semibold">
                    Esta herencia ya fue reclamada
                  </h3>
                </CardContent>
              </Card>
            )}

            {!vaultInfo.isTriggered && (
              <Card>
                <CardContent className="p-6 md:p-8 text-center">
                  <AlertCircle className="mx-auto mb-4 h-12 w-12 text-amber-600" />
                  <h3 className="text-xl font-semibold">
                    La bóveda aún no se ha activado
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    El dueño todavía no ha superado el período de inactividad.
                  </p>
                </CardContent>
              </Card>
            )}

            <Button
              variant="ghost"
              onClick={() => {
                setVaultInfo(null);
                setOwnerAddress("");
                setBeneficiary2Address("");
                setError(null);
                setSuccess(null);
              }}
              className="w-full"
            >
              Buscar otra bóveda
            </Button>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/">
            <Button variant="ghost">
              <Home className="mr-2 h-4 w-4" />
              Volver al inicio
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
