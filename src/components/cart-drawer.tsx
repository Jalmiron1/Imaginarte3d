'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from './cart-provider';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Trash2, ShoppingBag, Plus, Minus, CreditCard,
  Loader2, X, ShoppingCart, ArrowRight
} from 'lucide-react';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { cartItems, removeFromCart, updateQuantity, clearCart, cartTotal, isLoaded } = useCart();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [shippingOption, setShippingOption] = useState('DAC - Envío a Domicilio');
  const [paymentMethod, setPaymentMethod] = useState('mercadopago');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [view, setView] = useState<'cart' | 'checkout'>('cart');

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (cartItems.length === 0) { setError('El carrito está vacío'); return; }
    setLoading(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          customerAddress: `${address} | Envío: ${shippingOption} | Método de Pago: ${paymentMethod === 'mercadopago' ? 'Mercado Pago' : 'Transferencia Bancaria'}`,
          paymentMethod,
          items: cartItems.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Hubo un error al generar la orden');
      clearCart();
      onClose();
      if (data.isTransfer) {
        window.location.href = `/checkout/success?orderId=${data.orderId}&paymentMethod=transfer`;
      } else {
        window.location.href = data.sandboxInitPoint || data.initPoint;
      }
    } catch (err: any) {
      setError(err.message || 'Error de conexión con el servidor');
      setLoading(false);
    }
  };

  const inputClass = "bg-card border-border text-foreground text-sm h-9";
  const selectClass = "flex h-9 w-full rounded-md border border-input bg-card px-3 py-1 text-sm text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50";

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-md flex flex-col bg-card border-l border-border shadow-2xl transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            {view === 'checkout' && (
              <button
                onClick={() => setView('cart')}
                className="text-muted-foreground hover:text-foreground mr-1 transition-colors"
              >
                ←
              </button>
            )}
            <ShoppingCart className="h-5 w-5 text-primary" />
            <h2 className="font-bold text-lg text-foreground">
              {view === 'cart' ? 'Tu Carrito' : 'Finalizar Pedido'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">

          {/* ── VISTA CARRITO ── */}
          {view === 'cart' && (
            <>
              {!isLoaded ? (
                <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" /> Cargando...
                </div>
              ) : cartItems.length === 0 ? (
                <div className="flex flex-col items-center gap-5 py-16 text-center">
                  <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <ShoppingBag className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-foreground">Tu carrito está vacío</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Explorá el catálogo y encontrá tu próxima impresión 3D.
                    </p>
                  </div>
                  <Button onClick={onClose} asChild className="cursor-pointer">
                    <Link href="/productos">Ver Productos</Link>
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-5">
                  {cartItems.map((item) => {
                    const unitPrice = item.price * (1 - item.discount / 100);
                    const subtotal = unitPrice * item.quantity;
                    return (
                      <div key={item.productId} className="flex gap-3 border-b border-border pb-5 last:border-0 last:pb-0">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-16 w-16 rounded-lg object-contain bg-muted border border-border shrink-0 p-1"
                        />
                        <div className="flex-1 flex flex-col justify-between min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <div className="min-w-0">
                              <h3 className="font-semibold text-sm line-clamp-1">{item.name}</h3>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                ${unitPrice.toLocaleString('es-UY', { minimumFractionDigits: 0 })} c/u
                              </p>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.productId)}
                              className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <div className="flex items-center rounded-md border border-border bg-muted p-0.5 gap-1">
                              <button
                                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className="h-6 w-6 flex items-center justify-center rounded hover:bg-card disabled:opacity-40 transition-colors"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-7 text-center text-xs font-semibold">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                disabled={item.quantity >= item.maxStock}
                                className="h-6 w-6 flex items-center justify-center rounded hover:bg-card disabled:opacity-40 transition-colors"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                            <span className="font-bold text-sm">
                              ${subtotal.toLocaleString('es-UY', { minimumFractionDigits: 0 })}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <button
                    onClick={clearCart}
                    className="text-xs text-muted-foreground hover:text-destructive transition-colors self-start mt-1"
                  >
                    Vaciar carrito
                  </button>
                </div>
              )}
            </>
          )}

          {/* ── VISTA CHECKOUT ── */}
          {view === 'checkout' && (
            <form id="checkout-form" onSubmit={handleCheckout} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="drawer-name">Nombre Completo</Label>
                <Input id="drawer-name" placeholder="Juan Pérez" value={name} onChange={e => setName(e.target.value)} required disabled={loading} className={inputClass} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="drawer-email">Correo Electrónico</Label>
                <Input id="drawer-email" type="email" placeholder="juan@example.com" value={email} onChange={e => setEmail(e.target.value)} required disabled={loading} className={inputClass} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="drawer-phone">Teléfono de Contacto</Label>
                <Input id="drawer-phone" placeholder="099 000 000" value={phone} onChange={e => setPhone(e.target.value)} required disabled={loading} className={inputClass} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="drawer-address">Dirección</Label>
                <Input id="drawer-address" placeholder="Av. 18 de Julio 1234, Montevideo" value={address} onChange={e => setAddress(e.target.value)} required disabled={loading} className={inputClass} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="drawer-shipping">Opción de Envío</Label>
                <select id="drawer-shipping" value={shippingOption} onChange={e => setShippingOption(e.target.value)} disabled={loading} className={selectClass}>
                  <option value="DAC - Envío a Domicilio">DAC - Envío a Domicilio</option>
                  <option value="DAC - Retiro en Agencia">DAC - Retiro en Agencia</option>
                  <option value="Retiro en Taller (Gratis)">Retiro en Taller (Gratis)</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="drawer-payment">Forma de Pago</Label>
                <select id="drawer-payment" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} disabled={loading} className={selectClass}>
                  <option value="mercadopago">Mercado Pago</option>
                  <option value="transfer">Transferencia Bancaria</option>
                </select>
              </div>
              {error && (
                <div className="rounded-lg bg-destructive/10 p-3 text-xs font-semibold text-destructive">{error}</div>
              )}
            </form>
          )}
        </div>

        {/* Footer fijo */}
        {isLoaded && cartItems.length > 0 && (
          <div className="shrink-0 border-t border-border bg-card px-5 py-4 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-muted-foreground">Total</span>
              <span className="text-2xl font-extrabold text-foreground">
                ${cartTotal.toLocaleString('es-UY', { minimumFractionDigits: 0 })}
              </span>
            </div>

            {view === 'cart' ? (
              <Button
                className="w-full gap-2 cursor-pointer"
                onClick={() => setView('checkout')}
              >
                Finalizar Pedido
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                form="checkout-form"
                disabled={loading}
                className="w-full gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {paymentMethod === 'mercadopago' ? 'Redireccionando...' : 'Procesando pedido...'}
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" />
                    {paymentMethod === 'mercadopago' ? 'Pagar con Mercado Pago' : 'Confirmar Pedido (Transferencia)'}
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
