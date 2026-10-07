"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import * as anchor from "@coral-xyz/anchor";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useProgram, getVaultPDA } from "@/lib/program";
import {
  Shield,
  Activity,
  Pause,
  Play,
  Users,
  Coins,
  Clock,
  AlertCircle,
  CheckCircle2,
  Home,
  Trash2,
} from "lucide-react";

export default function VaultPage() {
  const { connected, publicKey } = useWallet();
  const program = useProgram();

  const [vault, setVault] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);

  const [pauseDays, setPauseDays] = useState(30);
  const [pauseOpen, setPauseOpen] = useState(false);

  const [cancelOpen, setCancelOpen] = useState(false);

  async function loadVault() {
    if (!program || !publicKey) {
      setLoading(false);
      return;
    }
    try {
      const [vaultPda] = getVaultPDA(publicKey);
      const vaultAccount = await program.account.vault.fetch(vaultPda);
      setVault({ ...vaultAccount });
      setRefreshTick((t) => t + 1);
    } catch (err: any) {
      setVault(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadVault();
  }, [program, publicKey]);

  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshTick((t) => t + 1);
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  async function handlePing() {
    if (!program || !publicKey) return;
    setActionLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const [vaultPda] = getVaultPDA(publicKey);
      await program.methods
        .ping()
        .accounts({ owner: publicKey, vault: vaultPda })
        .rpc();

      await new Promise((r) => setTimeout(r, 1000));

      const updatedVault = await program.account.vault.fetch(vaultPda);
      setVault({ ...updatedVault });
      setRefreshTick((t) => t + 100);
      setSuccess("Timer reiniciado correctamente.");
    } catch (err: any) {
      setError(err.message || "Error al hacer ping");
    } finally {
      setActionLoading(false);
    }
  }

  async function handlePause() {
    if (!program || !publicKey) return;
    setActionLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const [vaultPda] = getVaultPDA(publicKey);
      await program.methods
        .pauseInheritance(new anchor.BN(pauseDays))
        .accounts({ owner: publicKey, vault: vaultPda })
        .rpc();
      setPauseOpen(false);
      await new Promise((r) => setTimeout(r, 1000));
      await loadVault();
      setSuccess(`Bóveda pausada por ${pauseDays} días.`);
    } catch (err: any) {
      setError(err.message || "Error al pausar");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleResume() {
    if (!program || !publicKey) return;
    setActionLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const [vaultPda] = getVaultPDA(publicKey);
      await program.methods
        .resumeInheritance()
        .accounts({ owner: publicKey, vault: vaultPda })
        .rpc();
      await new Promise((r) => setTimeout(r, 1000));
      await loadVault();
      setSuccess("Bóveda reanudada. Timer reiniciado.");
    } catch (err: any) {
      setError(err.message || "Error al reanudar");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCancelVault() {
    if (!program || !publicKey) return;
    setActionLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const [vaultPda] = getVaultPDA(publicKey);
      const [solVaultPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("sol_vault"), publicKey.toBuffer()],
        program.programId
      );

      await program.methods
        .cancelVault()
        .accounts({
          owner: publicKey,
          vault: vaultPda,
          solVault: solVaultPda,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      setCancelOpen(false);
      setVault(null);
      setSuccess("Bóveda cancelada. Fondos devueltos.");
    } catch (err: any) {
      setError(err.message || "Error al cancelar la bóveda");
    } finally {
      setActionLoading(false);
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
            Necesitas conectar tu billetera para ver tu bóveda.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-24 text-center">
          <p className="text-muted-foreground">Cargando tu bóveda...</p>
        </div>
      </div>
    );
  }

  if (!vault) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto flex flex-col items-center justify-center px-4 py-24 text-center">
          <Shield className="mb-6 h-12 w-12 text-primary" />
          <h1 className="mb-2 text-2xl font-bold">Aún no tienes una bóveda</h1>
          <p className="mb-6 text-muted-foreground">
            Crea tu primera bóveda de herencia en menos de 3 minutos.
          </p>
          <Link href="/create">
            <Button size="lg">Crear mi bóveda</Button>
          </Link>
        </div>
      </div>
    );
  }

  void refreshTick;

  const now = Math.floor(Date.now() / 1000);
  const lastActive = vault.lastActive.toNumber();
  const period = vault.inactivityPeriod.toNumber();
  const paused = vault.paused;
  const pausedAt = vault.pausedAt.toNumber();
  const maxPause = vault.maxPauseDuration.toNumber();
  const guaranteeLamports = vault.guaranteeLamports
    ? vault.guaranteeLamports.toNumber()
    : 0;

  const expiresAt = paused ? pausedAt + maxPause : lastActive + period;
  const secondsLeft = Math.max(0, expiresAt - now);
  const daysLeft = Math.floor(secondsLeft / 86400);
  const hoursLeft = Math.floor((secondsLeft % 86400) / 3600);
  const minutesLeft = Math.floor((secondsLeft % 3600) / 60);

  const status = vault.isTriggered
    ? "activada"
    : paused
    ? "pausada"
    : "activa";

  return (
    <div className="min-h-screen">
      <Header />

      <div className="container mx-auto max-w-3xl px-4 py-12 md:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Mi bóveda
            </h1>
            <p className="mt-1 text-muted-foreground">
              Gestiona tu herencia y confirma que estás bien
            </p>
          </div>
          <Badge
            variant={
              status === "activa"
                ? "default"
                : status === "pausada"
                ? "secondary"
                : "destructive"
            }
            className="text-sm"
          >
            {status === "activa" && "✅ Activa"}
            {status === "pausada" && "⏸ Pausada"}
            {status === "activada" && "🚨 Activada"}
          </Badge>
        </div>

        <Card>
          <CardContent className="p-6 md:p-8">
            <div className="mb-8">
              <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>
                  {status === "activada"
                    ? "Herencia activada"
                    : paused
                    ? "Tiempo restante de pausa"
                    : "Próxima activación en"}
                </span>
              </div>
              <div className="text-3xl font-bold tracking-tight md:text-4xl">
                {status === "activada"
                  ? "Ya se activó"
                  : `${daysLeft} día${daysLeft !== 1 ? "s" : ""}, ${hoursLeft} hora${hoursLeft !== 1 ? "s" : ""} y ${minutesLeft} minuto${minutesLeft !== 1 ? "s" : ""}`}
              </div>
              {status !== "activada" && (
                <div className="mt-1 text-sm text-muted-foreground">
                  {paused
                    ? `Se activará automáticamente si no reanudas antes`
                    : `Si no entras antes de esa fecha, tus herederos podrán reclamar`}
                </div>
              )}
            </div>

            {!vault.isTriggered && (
              <div className="space-y-3">
                {!paused ? (
                  <>
                    <Button
                      onClick={handlePing}
                      disabled={actionLoading}
                      size="lg"
                      className="w-full"
                    >
                      <Activity className="mr-2 h-5 w-5" />
                      {actionLoading ? "Confirmando..." : "Estoy aquí"}
                    </Button>
                    <p className="text-center text-sm text-muted-foreground">
                      Pulsa este botón para reiniciar el temporizador
                    </p>

                    <Dialog open={pauseOpen} onOpenChange={setPauseOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="lg" className="w-full">
                          <Pause className="mr-2 h-5 w-5" />
                          Me voy de viaje
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Pausar la cuenta por viaje</DialogTitle>
                          <DialogDescription>
                            Mientras estés fuera, el temporizador no correrá.
                            Si no vuelves dentro del tiempo elegido, la
                            herencia se activará igual.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <Label htmlFor="pauseDays">
                            ¿Cuántos días estarás fuera?
                          </Label>
                          <Input
                            id="pauseDays"
                            type="number"
                            min={1}
                            max={90}
                            value={pauseDays}
                            onChange={(e) =>
                              setPauseDays(Number(e.target.value))
                            }
                            className="mt-2"
                          />
                          <p className="mt-2 text-sm text-muted-foreground">
                            Máximo 90 días (3 meses).
                          </p>
                        </div>
                        <DialogFooter>
                          <Button
                            variant="ghost"
                            onClick={() => setPauseOpen(false)}
                          >
                            Cancelar
                          </Button>
                          <Button onClick={handlePause} disabled={actionLoading}>
                            {actionLoading ? "Pausando..." : "Pausar"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="lg"
                          className="w-full"
                        >
                          <Trash2 className="mr-2 h-5 w-5" />
                          Cancelar bóveda
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>¿Terminar el contrato?</DialogTitle>
                          <DialogDescription>
                            Al cancelar la bóveda:
                            <br />• Recuperarás tu garantía en SOL.
                            <br />• Tus herederos ya no podrán reclamar nada.
                            <br />• Esta acción no se puede deshacer.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button
                            variant="ghost"
                            onClick={() => setCancelOpen(false)}
                          >
                            Volver
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={handleCancelVault}
                            disabled={actionLoading}
                          >
                            {actionLoading
                              ? "Cancelando..."
                              : "Sí, terminar contrato"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </>
                ) : (
                  <>
                    <div className="rounded-lg border border-amber-500/30 bg-amber-50 p-4 text-sm text-amber-900">
                      <div className="mb-1 font-medium">
                        ⏸ Cuenta pausada por viaje
                      </div>
                      <p>
                        El temporizador está detenido. Cuando vuelvas, pulsa
                        el botón de abajo para reanudar.
                      </p>
                    </div>
                    <Button
                      onClick={handleResume}
                      disabled={actionLoading}
                      size="lg"
                      className="w-full"
                    >
                      <Play className="mr-2 h-5 w-5" />
                      {actionLoading ? "Reanudando..." : "Ya volví"}
                    </Button>
                  </>
                )}

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
              </div>
            )}

            {vault.isTriggered && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                <div className="mb-1 font-medium">🚨 Herencia activada</div>
                <p>
                  Tu bóveda ha sido activada. Tus herederos pueden reclamar los
                  fondos desde la página de reclamación.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                <Users className="h-4 w-4 text-primary" />
                Herederos
              </div>
              <div className="space-y-2 text-sm">
                <div className="rounded bg-secondary/50 p-2 font-mono text-xs">
                  {vault.beneficiaryPubkeys[0].toBase58().slice(0, 8)}...
                  {vault.beneficiaryPubkeys[0].toBase58().slice(-4)}
                </div>
                <div className="rounded bg-secondary/50 p-2 font-mono text-xs">
                  {vault.beneficiaryPubkeys[1].toBase58().slice(0, 8)}...
                  {vault.beneficiaryPubkeys[1].toBase58().slice(-4)}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                <Coins className="h-4 w-4 text-primary" />
                Garantía bloqueada
              </div>
              <div className="text-2xl font-bold">
                {(guaranteeLamports / 1_000_000_000).toFixed(4)} SOL
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Se devolverá a tus herederos
              </p>
            </CardContent>
          </Card>
        </div>

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
