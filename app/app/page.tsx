"use client";

import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { Header } from "@/components/Header";
import { WalletButton } from "@/components/WalletButton";
import { Button } from "@/components/ui/button";
import {
  Shield,
  HeartHandshake,
  Clock,
  Lock,
  Users,
  Mail,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export default function Home() {
  const { connected } = useWallet();

  return (
    <div className="min-h-screen">
      <Header />

      {/* HERO */}
      <section className="container mx-auto px-4 md:px-8 py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-sm text-muted-foreground">
            <HeartHandshake className="h-4 w-4 text-primary" />
            <span>Pensado para las personas que más quieres</span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Tus criptomonedas,
            <br />
            <span className="text-primary">seguras para tu familia</span>
          </h1>

          <p className="mt-6 text-lg text-muted-foreground md:text-xl">
            Configura tu bóveda en minutos y asegúrate de que, si algún día no
            puedes acceder a tus activos, tus seres queridos podrán hacerlo por
            ti.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            {connected ? (
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/create">
                  Crear mi bóveda
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <div className="flex items-center gap-3 rounded-lg border border-dashed border-border bg-secondary/30 px-6 py-3 text-sm text-muted-foreground">
                <Lock className="h-4 w-4" />
                <span>Conecta tu billetera para empezar</span>
              </div>
            )}
            <Button asChild variant="ghost" size="lg" className="w-full sm:w-auto">
              <Link href="/help">¿Cómo funciona?</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="border-t border-border bg-secondary/30">
        <div className="container mx-auto px-4 md:px-8 py-16 md:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Tan simple como respirar
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Tres pasos. Cinco minutos. Tranquilidad para toda la vida.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {/* Paso 1 */}
            <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Users className="h-6 w-6" />
              </div>
              <div className="mb-2 text-sm font-medium text-primary">
                Paso 1
              </div>
              <h3 className="text-xl font-semibold">Elige a tus herederos</h3>
              <p className="mt-2 text-muted-foreground">
                Añade los datos de las dos personas en las que más confías.
                Ellos serán quienes reciban tu herencia.
              </p>
            </div>

            {/* Paso 2 */}
            <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Clock className="h-6 w-6" />
              </div>
              <div className="mb-2 text-sm font-medium text-primary">
                Paso 2
              </div>
              <h3 className="text-xl font-semibold">Confirma que estás bien</h3>
              <p className="mt-2 text-muted-foreground">
                Cada cierto tiempo, entra y pulsa un botón para decir «estoy
                aquí». Si te vas de viaje, pausa la cuenta con un clic.
              </p>
            </div>

            {/* Paso 3 */}
            <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Mail className="h-6 w-6" />
              </div>
              <div className="mb-2 text-sm font-medium text-primary">
                Paso 3
              </div>
              <h3 className="text-xl font-semibold">
                Ellos reciben la llamada
              </h3>
              <p className="mt-2 text-muted-foreground">
                Si dejas de dar señales de vida, avisaremos a tus herederos para
                que reclamen lo que es suyo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SEGURIDAD */}
      <section className="container mx-auto px-4 md:px-8 py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 text-primary">
            <Shield className="h-5 w-5" />
            <span className="text-sm font-medium uppercase tracking-wide">
              Seguridad primero
            </span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Nunca tocamos tus criptomonedas
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Tu dinero permanece bajo tu control en todo momento. Solo nos
            aseguramos de que, si algún día no puedes, alguien pueda.
          </p>

          <div className="mt-12 space-y-4 text-left">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
              <div>
                <div className="font-medium">
                  Tus claves nunca salen de tu billetera
                </div>
                <p className="text-sm text-muted-foreground">
                  No guardamos tu frase semilla ni tus claves privadas.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
              <div>
                <div className="font-medium">
                  Decides cuándo y a quién
                </div>
                <p className="text-sm text-muted-foreground">
                  Tú eliges el tiempo de espera y quiénes son tus herederos.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
              <div>
                <div className="font-medium">
                  Todo queda registrado y protegido
                </div>
                <p className="text-sm text-muted-foreground">
                  Cada acción queda en la blockchain de Solana, sin posibilidad
                  de fraude.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="border-t border-border bg-secondary/30">
        <div className="container mx-auto px-4 md:px-8 py-16 text-center md:py-24">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Empieza hoy. Es gratis.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Protege a tu familia en menos tiempo del que tardas en hacer un café.
          </p>
          <div className="mt-8 flex justify-center">
            {connected ? (
              <Button asChild size="lg">
                <Link href="/create">
                  Crear mi bóveda
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <WalletButton />
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border">
        <div className="container mx-auto px-4 md:px-8 py-8">
          <div className="flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span>Legado © {new Date().getFullYear()}</span>
            </div>
            <div className="flex gap-6">
              <Link href="/help" className="hover:text-foreground">
                Ayuda
              </Link>
              <Link href="/legal" className="hover:text-foreground">
                Legal
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
