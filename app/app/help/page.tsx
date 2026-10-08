"use client";

import Link from "next/link";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle2,
  ArrowRight,
  Home,
  HelpCircle,
} from "lucide-react";

export default function HelpPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto max-w-3xl px-4 py-12 md:px-8">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-sm text-muted-foreground">
            <HelpCircle className="h-4 w-4 text-primary" />
            <span>Cómo funciona Legado</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Tus criptomonedas,
            <br />
            <span className="text-primary">a salvo para tus seres queridos</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Legado asegura que, si un día ya no puedes acceder a tus criptos,
            tus herederos puedan hacerlo por ti. Sin intermediarios, sin
            compartir tus claves, sin perder el control.
          </p>
        </div>

        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold">¿Cómo funciona?</h2>
          <div className="space-y-4">
            <div className="flex gap-4 rounded-lg border border-border bg-card p-6">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <span className="text-lg font-bold">1</span>
              </div>
              <div>
                <h3 className="mb-2 font-semibold">Creas tu bóveda en 3 minutos</h3>
                <p className="text-sm text-muted-foreground">
                  Conectas tu billetera, eliges a tus 2 herederos (con sus
                  correos y direcciones), y bloqueas una pequeña garantía.
                  Esa garantía se guarda en un contrato inteligente en Solana.
                </p>
              </div>
            </div>

            <div className="flex gap-4 rounded-lg border border-border bg-card p-6">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <span className="text-lg font-bold">2</span>
              </div>
              <div>
                <h3 className="mb-2 font-semibold">Confirmas que estás bien</h3>
                <p className="text-sm text-muted-foreground">
                  Cada cierto tiempo (tú decides: 1, 3, 6 meses...), entras a
                  tu bóveda y pulsas un botón para decir "estoy aquí". Puedes
                  depositar más criptos si quieres heredarlas.
                </p>
              </div>
            </div>

            <div className="flex gap-4 rounded-lg border border-border bg-card p-6">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <span className="text-lg font-bold">3</span>
              </div>
              <div>
                <h3 className="mb-2 font-semibold">Si dejas de aparecer, avisamos</h3>
                <p className="text-sm text-muted-foreground">
                  Si el tiempo pasa y no has confirmado, el sistema activa la
                  herencia. Tus herederos reciben un correo con instrucciones.
                  Para retirar, los dos deben firmar juntos.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold">🔐 Tu seguridad, primero</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
              <div>
                <div className="font-medium">Nunca tocamos tus claves privadas</div>
                <p className="text-sm text-muted-foreground">
                  No guardamos tu frase semilla, ni claves, ni contraseñas.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
              <div>
                <div className="font-medium">Todo pasa en la blockchain de Solana</div>
                <p className="text-sm text-muted-foreground">
                  Las reglas están en un contrato público. Nadie puede cambiarlas.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
              <div>
                <div className="font-medium">Necesitas 2 de 3 firmas</div>
                <p className="text-sm text-muted-foreground">
                  Ni tú solo, ni un heredero solo, pueden retirar. Se necesitan
                  dos firmas.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
              <div>
                <div className="font-medium">Puedes cancelar cuando quieras</div>
                <p className="text-sm text-muted-foreground">
                  Antes de expirar, cancelas y recuperas todo.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold">🧳 ¿Y si me voy de viaje?</h2>
          <Card>
            <CardContent className="p-6">
              <p className="mb-4 text-sm text-muted-foreground">
                Tienes un botón para pausar la cuenta. Si te vas 1, 2 o 3 meses
                sin acceso a internet, pausa el temporizador antes de salir.
              </p>
              <div className="rounded-lg border border-amber-500/30 bg-amber-50 p-4 text-sm text-amber-900">
                <div className="mb-1 font-medium">⚠️ Pausa máxima: 90 días</div>
                <p>
                  Si no reanudas al volver, la herencia se activa igual. Es una
                  red de seguridad para que no quede bloqueada para siempre.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold">Preguntas frecuentes</h2>
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="mb-2 font-semibold">¿Qué pasa si pierdo mi billetera?</div>
                <p className="text-sm text-muted-foreground">
                  Tu bóveda sigue activa. Mientras puedas restaurar tu billetera
                  con la frase semilla, podrás gestionarla.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="mb-2 font-semibold">¿Puedo cambiar los herederos después?</div>
                <p className="text-sm text-muted-foreground">
                  Sí, pero requiere cancelar la bóveda actual y crear una nueva.
                  Los herederos se fijan al crear la bóveda por seguridad.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="mb-2 font-semibold">¿Qué pasa con mi garantía si cancelo?</div>
                <p className="text-sm text-muted-foreground">
                  Se te devuelve íntegra. La garantía solo se queda mientras el
                  contrato esté activo.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="mb-2 font-semibold">¿Es legal esto?</div>
                <p className="text-sm text-muted-foreground">
                  Legado es una herramienta técnica, no un servicio legal. La
                  ley varía por país. Consulta con un abogado.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="mb-2 font-semibold">¿Qué tokens puedo heredar?</div>
                <p className="text-sm text-muted-foreground">
                  SOL (moneda nativa de Solana).
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="mb-2 font-semibold">¿Qué coste tiene?</div>
                <p className="text-sm text-muted-foreground">
                  Las comisiones de red de Solana más los costos por servicio
                  (0.005 SOL) más la garantía que decidas bloquear.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-secondary/30 p-8 text-center">
          <h2 className="mb-4 text-2xl font-bold">¿Listo para proteger a tu familia?</h2>
          <p className="mb-6 text-muted-foreground">
            Crea tu bóveda en menos de 3 minutos. Es gratis.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/create">
              <Button size="lg">
                Crear mi bóveda
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" size="lg">
                <Home className="mr-2 h-4 w-4" />
                Volver al inicio
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
