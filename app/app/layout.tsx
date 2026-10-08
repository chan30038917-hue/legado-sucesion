import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import "@solana/wallet-adapter-react-ui/styles.css";
import { Providers } from "./providers";
import { Footer } from "@/components/Footer";
import { Background } from "@/components/Background";
import { cn } from "@/lib/utils";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Legado — Protege tus criptomonedas para tus seres queridos",
  description:
    "Legado te ayuda a asegurar que tus criptomonedas lleguen a tus herederos si algún día no puedes acceder a ellas.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={cn("font-sans dark", geist.variable)}>
      <body className="relative flex min-h-screen flex-col text-foreground antialiased">
        <Background />
        <Providers>
          <main className="relative z-10 flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
