'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/components/cart-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, ShoppingBag, Plus, Minus, CreditCard, Loader2 } from 'lucide-react';

export default function CarritoPage() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, cartTotal, isLoaded } = useCart();
  
  // Datos de envío y contacto
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (cartItems.length === 0) {
      setError('El carrito está vacío');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          customerAddress: address,
          items: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Hubo un error al generar la orden');
      }

      // Vaciar carrito
      clearCart();

      // Redirigir a Mercado Pago
      const redirectUrl = data.sandboxInitPoint || data.initPoint;
      window.location.href = redirectUrl;
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error de conexión con el servidor');
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-sm text-muted-foreground">
        Cargando tu carrito...
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-md flex flex-col items-center gap-6">
        <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
          <ShoppingBag className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Tu carrito está vacío</h2>
        <p className="text-sm text-muted-foreground -mt-2">
          Aún no has añadido ningún producto. Revisa nuestro catálogo para ver los modelos e impresiones disponibles.
        </p>
        <Link href="/productos">
          <Button className="cursor-pointer">Ver Productos</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-6xl">
      <h1 className="text-3xl font-bold tracking-tight text-foreground mb-8">Carrito de Compras</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Listado de items del carrito */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="rounded-xl border border-border bg-card p-6 flex flex-col gap-6">
            {cartItems.map((item) => {
              const unitPrice = item.price * (1 - item.discount / 100);
              const subtotal = unitPrice * item.quantity;

              return (
                <div key={item.productId} className="flex gap-4 border-b border-border pb-6 last:border-0 last:pb-0">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-20 w-20 rounded-lg object-cover bg-muted shrink-0 border border-border"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h3 className="font-semibold text-sm line-clamp-1">{item.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          ${unitPrice.toLocaleString('es-UY', { minimumFractionDigits: 0 })} c/u
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromCart(item.productId)}
                        className="text-muted-foreground hover:text-destructive h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex justify-between items-center mt-2">
                      {/* Control de cantidad */}
                      <div className="flex items-center rounded-md border border-border bg-muted p-0.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="h-6 w-6 rounded"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-xs font-semibold">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          disabled={item.quantity >= item.maxStock}
                          className="h-6 w-6 rounded"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <span className="font-bold text-sm text-foreground">
                        ${subtotal.toLocaleString('es-UY', { minimumFractionDigits: 0 })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center">
            <Button variant="outline" size="sm" onClick={clearCart} className="cursor-pointer text-muted-foreground hover:text-destructive">
              Vaciar Carrito
            </Button>
            <Link href="/productos" className="text-sm font-semibold text-primary hover:text-primary/80">
              Seguir Comprando
            </Link>
          </div>
        </div>

        {/* Resumen del Pedido y Checkout Form */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Resumen del Pedido</CardTitle>
              <CardDescription>Completa los datos del envío para proceder a Mercado Pago.</CardDescription>
            </CardHeader>
            <form onSubmit={handleCheckout}>
              <CardContent className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="name">Nombre Completo</Label>
                  <Input
                    id="name"
                    placeholder="Juan Pérez"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={loading}
                    className="bg-card text-foreground"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="juan@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="bg-card text-foreground"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="phone">Teléfono de Contacto</Label>
                  <Input
                    id="phone"
                    placeholder="1122334455"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    disabled={loading}
                    className="bg-card text-foreground"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="address">Dirección Completa de Envío</Label>
                  <Input
                    id="address"
                    placeholder="Av. Rivadavia 1234, CABA"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    disabled={loading}
                    className="bg-card text-foreground"
                  />
                </div>

                {error && (
                  <div className="rounded-lg bg-destructive/10 p-3 text-xs font-semibold text-destructive">
                    {error}
                  </div>
                )}

                <div className="border-t border-border pt-4 mt-2 flex justify-between items-center">
                  <span className="font-semibold text-base">Total</span>
                  <span className="font-extrabold text-2xl text-foreground">
                    ${cartTotal.toLocaleString('es-UY', { minimumFractionDigits: 0 })}
                  </span>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={loading} className="w-full gap-2 cursor-pointer">
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Redireccionando a Mercado Pago...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4" />
                      Pagar con Mercado Pago
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}

