import Link from "next/link";
import { Shield } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border/60 bg-secondary/20">
      <div className="container mx-auto max-w-5xl px-4 py-10 md:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Shield className="h-4 w-4" />
              </div>
              <span className="text-base font-semibold tracking-tight">Legado</span>
            </div>
            <p className="max-w-sm text-sm text-muted-foreground">
              Herencia de criptomonedas en la blockchain de Solana. Sin
              intermediarios, sin custodia, sin perder el control.
            </p>
          </div>
          <div>
            <div className="mb-3 text-sm font-semibold">Producto</div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/create" className="hover:text-foreground transition-colors">Crear bóveda</Link></li>
              <li><Link href="/claim" className="hover:text-foreground transition-colors">Reclamar herencia</Link></li>
              <li><Link href="/vault" className="hover:text-foreground transition-colors">Mi bóveda</Link></li>
            </ul>
          </div>
          <div>
            <div className="mb-3 text-sm font-semibold">Recursos</div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/help" className="hover:text-foreground transition-colors">Ayuda</Link></li>
              <li><Link href="/legal" className="hover:text-foreground transition-colors">Legal</Link></li>
              <li>
                <a href="https://explorer.solana.com/address/2yNo3xJD5Qj1HYiAZZ4tKYgRp5HwLt2VXHjzckETMpYG?cluster=devnet" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                  Contrato en Solana
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground md:flex-row">
          <div>© {new Date().getFullYear()} Legado. Todos los derechos reservados.</div>
          <div className="flex items-center gap-4">
            <span>Hecho en Solana</span>
            <span>·</span>
            <Link href="/legal" className="hover:text-foreground transition-colors">Aviso legal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
