import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/cart-provider";
import { Navbar } from "@/components/navbar";
import { PrinterTrailBackground } from "@/components/printer-trail-background";
import Link from "next/link";
import { Lock } from "lucide-react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Imaginarte3D | Impresiones 3D de alta calidad",
  description: "E-commerce de impresiones 3D. Encuentra figuras articuladas, macetas, miniaturas de rol, soportes y más con envío directo a tu hogar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full scroll-smooth">
      <body className={`${geistSans.variable} ${geistMono.variable} h-full antialiased bg-background text-foreground flex flex-col font-sans`}>
        <CartProvider>
          <PrinterTrailBackground />
          <Navbar />
          <main className="flex-1 relative z-10">
            {children}
          </main>
          <footer className="border-t border-border bg-muted py-6 mt-12">
            <div className="container mx-auto px-4 text-center text-xs text-muted-foreground relative">
              <p>&copy; {new Date().getFullYear()} Imaginarte3D. Todos los derechos reservados.</p>
              <p className="mt-1">Diseñado e impreso con tecnología de alta precisión.</p>
              <Link 
                href="/admin" 
                className="absolute right-4 bottom-1/2 translate-y-1/2 opacity-30 hover:opacity-100 transition-opacity duration-200 text-muted-foreground"
                title="Panel de Control"
              >
                <Lock className="h-3.5 w-3.5" />
              </Link>
            </div>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
