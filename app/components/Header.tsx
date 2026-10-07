"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletButton } from "./WalletButton";
import { Shield } from "lucide-react";

export function Header() {
  const { connected } = useWallet();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform group-hover:scale-105">
            <Shield className="h-5 w-5" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-semibold tracking-tight">Legado</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/help" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            ¿Cómo funciona?
          </Link>
          {mounted && connected && (
            <>
              <Link href="/vault" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Mi bóveda
              </Link>
              <Link href="/claim" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Reclamar
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <WalletButton />
        </div>
      </div>
    </header>
  );
}
