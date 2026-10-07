"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import * as anchor from "@coral-xyz/anchor";
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProgram, getVaultPDA } from "@/lib/program";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  User,
  Clock,
  Coins,
  Shield,
} from "lucide-react";

type Step = 1 | 2 | 3;

// Wallet donde se deposita la comisión (tu wallet)
const FEE_WALLET = new PublicKey(
  "6NkMSjdnaw4bpgVYV9Ss7nRTofPvpfCd3stJHD7Nqjsu"
);

export default function CreateVaultPage() {
  const { connected, publicKey } = useWallet();
  const program = useProgram();
  const router = useRouter();

  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [beneficiary1, setBeneficiary1] = useState("");
  const [beneficiary2, setBeneficiary2] = useState("");
  const [email1, setEmail1] = useState("");
  const [email2, setEmail2] = useState("");
  const [months, setMonths] = useState(6);
  const [guaranteeSol, setGuaranteeSol] = useState(0.05);

  function nextStep() {
    setError(null);
    if (step === 1) {
      if (!beneficiary1 || !beneficiary2) {
        setError("Rellena las dos direcciones de herederos");
        return;
      }
      if (!email1 || !email2) {
        setError("Rellena los dos correos electrónicos");
        return;
      }
      try {
        new PublicKey(beneficiary1);
        new PublicKey(beneficiary2);
      } catch {
        setError("Una de las direcciones no es válida");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (months < 1 || months > 60) {
        setError("El período debe estar entre 1 y 60 meses");
        return;
      }
      setStep(3);
    }
  }

  function prevStep() {
    setError(null);
    if (step === 3) setStep(2);
    else if (step === 2) setStep(1);
  }

  async function handleSubmit() {
    if (!program || !publicKey) {
      setError("Conecta tu billetera primero");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const b1 = new PublicKey(beneficiary1);
      const b2 = new PublicKey(beneficiary2);

      const inactivityPeriod = new BN(months * 30 * 24 * 60 * 60);
      const guaranteeLamports = new BN(Math.floor(guaranteeSol * 1_000_000_000));

      const [vaultPda] = getVaultPDA(publicKey);
      const [solVaultPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("sol_vault"), publicKey.toBuffer()],
        program.programId
      );

      const tx = await program.methods
        .initializeVault(inactivityPeriod, [email1, email2], guaranteeLamports)
        .accounts({
          owner: publicKey,
          vault: vaultPda,
          solVault: solVaultPda,
          feeWallet: FEE_WALLET,
          beneficiary1: b1,
          beneficiary2: b2,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .rpc();

      setSuccess(`¡Bóveda creada! Tx: ${tx.slice(0, 20)}...`);
      setTimeout(() => router.push("/vault"), 2000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error al crear la bóveda");
    } finally {
      setLoading(false);
    }
  }

  if (!connected) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto flex flex-col items-center justify-center px-4 py-24 text-center">
          <Shield className="mb-6 h-12 w-12 text-primary" />
          <h1 className="mb-2 text-2xl font-bold">Conecta tu billetera</h1>
          <p className="mb-6 text-muted-foreground">
            Necesitas conectar tu billetera para crear una bóveda.
          </p>
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al inicio
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />

      <div className="container mx-auto max-w-3xl px-4 py-12 md:px-8">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Crea tu bóveda
          </h1>
          <p className="mt-2 text-muted-foreground">
            Te guiaremos paso a paso. Solo tardarás un par de minutos.
          </p>
        </div>

        <div className="mb-10 flex items-center justify-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                  s <= step
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {s < step ? <CheckCircle2 className="h-4 w-4" /> : s}
              </div>
              {s < 3 && (
                <div
                  className={`h-0.5 w-12 transition-colors ${
                    s < step ? "bg-primary" : "bg-secondary"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <Card>
          <CardContent className="p-6 md:p-8">
            {step === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">
                      ¿Quiénes son tus herederos?
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Las dos personas en las que más confías
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-lg border border-border p-4">
                    <Label className="mb-3 block text-sm font-medium">
                      Heredero 1
                    </Label>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Dirección de billetera
                        </Label>
                        <Input
                          value={beneficiary1}
                          onChange={(e) => setBeneficiary1(e.target.value)}
                          placeholder="Ej: 3Diy...DVtX"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Correo electrónico
                        </Label>
                        <Input
                          type="email"
                          value={email1}
                          onChange={(e) => setEmail1(e.target.value)}
                          placeholder="heredero1@ejemplo.com"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-border p-4">
                    <Label className="mb-3 block text-sm font-medium">
                      Heredero 2
                    </Label>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Dirección de billetera
                        </Label>
                        <Input
                          value={beneficiary2}
                          onChange={(e) => setBeneficiary2(e.target.value)}
                          placeholder="Ej: Fng4...Apm6"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Correo electrónico
                        </Label>
                        <Input
                          type="email"
                          value={email2}
                          onChange={(e) => setEmail2(e.target.value)}
                          placeholder="heredero2@ejemplo.com"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">
                      ¿Cuánto tiempo esperamos?
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Si dejas de entrar durante este tiempo, activaremos la
                      herencia
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block">
                    Meses de inactividad permitidos
                  </Label>
                  <Input
                    type="number"
                    value={months}
                    onChange={(e) => setMonths(Number(e.target.value))}
                    min={1}
                    max={60}
                  />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Recomendamos 6 meses. Puedes pausar la cuenta si te vas de
                    viaje.
                  </p>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Coins className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">
                      Garantía y comisión
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Un pequeño depósito en SOL y una comisión única
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block">
                    Garantía en SOL (se devuelve a tus herederos)
                  </Label>
                  <Input
                    type="number"
                    value={guaranteeSol}
                    onChange={(e) => setGuaranteeSol(Number(e.target.value))}
                    min={0.01}
                    step={0.01}
                  />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Recomendamos 0.05 SOL.
                  </p>
                </div>

                <div className="rounded-lg border border-border bg-secondary/30 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                    <Coins className="h-4 w-4 text-primary" />
                    Costos de creación
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Garantía (recuperable)</span>
                      <span>{guaranteeSol.toFixed(3)} SOL</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Comisión de servicio</span>
                      <span>0.005 SOL</span>
                    </div>
                    <div className="flex justify-between border-t border-border pt-1 font-semibold text-foreground">
                      <span>Total</span>
                      <span>{(guaranteeSol + 0.005).toFixed(3)} SOL</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-6 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="mt-6 flex items-start gap-3 rounded-lg border border-green-500/30 bg-green-50 p-4 text-sm text-green-800">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <div className="mt-8 flex items-center justify-between gap-3">
              {step > 1 ? (
                <Button variant="ghost" onClick={prevStep} disabled={loading}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Atrás
                </Button>
              ) : (
                <Link href="/">
                  <Button variant="ghost">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Cancelar
                  </Button>
                </Link>
              )}

              {step < 3 ? (
                <Button onClick={nextStep}>
                  Siguiente
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? "Creando..." : "Crear bóveda"}
                  {!loading && <CheckCircle2 className="ml-2 h-4 w-4" />}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
