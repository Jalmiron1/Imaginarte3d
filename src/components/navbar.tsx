'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from './cart-provider';
import { ShoppingCart, Menu, X, Box } from 'lucide-react';
import { Button } from './ui/button';

export function Navbar() {
  const { cartCount, isLoaded } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 font-bold text-xl tracking-tight text-foreground hover:opacity-80 transition-opacity">
          <Image src="/logo.png" alt="Imaginarte3D Logo" width={40} height={40} className="rounded-full object-cover" />
          <span className="bg-gradient-to-r from-[#FF6FA5] to-[#FFD39A] bg-clip-text text-transparent">Imaginarte3D</span>
        </Link>

        {/* Navegación Desktop */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="transition-colors hover:text-foreground/80 text-foreground/60">
            Inicio
          </Link>
          <Link href="/productos" className="transition-colors hover:text-foreground/80 text-foreground/60">
            Productos
          </Link>
        </nav>

        {/* Botones de acción */}
        <div className="flex items-center gap-2">
          <Link href="/carrito">
            <Button variant="outline" size="icon" className="relative h-10 w-10 rounded-full border-border hover:bg-accent transition-all">
              <ShoppingCart className="h-5 w-5" />
              {isLoaded && cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground ring-2 ring-background animate-in zoom-in duration-200">
                  {cartCount}
                </span>
              )}
            </Button>
          </Link>

          {/* Toggle de menú móvil */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Menú Móvil */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-background animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col gap-4 p-4 text-sm font-medium">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1 text-foreground/60 hover:text-foreground transition-colors"
            >
              Inicio
            </Link>
            <Link
              href="/productos"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1 text-foreground/60 hover:text-foreground transition-colors"
            >
              Productos
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
