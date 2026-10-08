"use client";

import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Scale, AlertCircle, FileText } from "lucide-react";

export default function LegalPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto max-w-3xl px-4 py-12 md:px-8">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-sm text-muted-foreground">
            <Scale className="h-4 w-4 text-primary" />
            <span>Información legal</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Aviso legal</h1>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="mb-2 flex items-center gap-2 font-semibold">
                <AlertCircle className="h-5 w-5 text-primary" />
                Legado no es un servicio legal
              </div>
              <p className="text-sm text-muted-foreground">
                Legado es una herramienta técnica que facilita la custodia
                programática de activos digitales en la blockchain de Solana.
                No sustituye un testamento, una herencia notarial ni asesoría
                legal profesional.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="mb-2 flex items-center gap-2 font-semibold">
                <FileText className="h-5 w-5 text-primary" />
                Naturaleza del servicio
              </div>
              <p className="text-sm text-muted-foreground">
                El contrato inteligente de Legado opera de forma autónoma en
                la red de Solana. Las condiciones de activación y reclamo
                están definidas exclusivamente por el código del programa y no
                pueden ser modificadas por terceros.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="mb-2 flex items-center gap-2 font-semibold">
                <Scale className="h-5 w-5 text-primary" />
                Responsabilidad del usuario
              </div>
              <p className="text-sm text-muted-foreground">
                Es responsabilidad del usuario consultar la legislación
                aplicable en su país respecto a la transmisión de activos
                digitales por causa de muerte. Legado no ofrece garantías
                legales sobre la efectividad de la herencia.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
