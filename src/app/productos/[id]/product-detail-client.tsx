'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/components/cart-provider';
import { Button } from '@/components/ui/button';
import { ShoppingCart, ArrowLeft, Minus, Plus, Box, Check } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discount: number;
  stock: number;
  category: string;
  imageUrl: string;
}

interface ProductDetailClientProps {
  product: Product;
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [addedSuccessfully, setAddedSuccessfully] = useState(false);

  const isOutOfStock = product.stock <= 0;
  const finalPrice = product.price * (1 - product.discount / 100);

  const handleDecrease = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleIncrease = () => {
    setQuantity((prev) => Math.min(product.stock, prev + 1));
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    
    addToCart(
      {
        productId: product.id,
        name: product.name,
        price: product.price,
        discount: product.discount,
        imageUrl: product.imageUrl,
        maxStock: product.stock,
      },
      quantity
    );

    setAddedSuccessfully(true);
    setTimeout(() => setAddedSuccessfully(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Botón Volver al catálogo */}
      <div>
        <Link href="/productos">
          <Button variant="ghost" size="sm" className="gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Volver al Catálogo
          </Button>
        </Link>
      </div>

      {/* Detalles del Producto */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Imagen del Producto */}
        <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-muted flex items-center justify-center">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
          />
          {product.discount > 0 && (
            <span className="absolute top-4 left-4 rounded-full bg-red-600 px-3 py-1 text-sm font-bold text-white shadow-md animate-pulse">
              Descuento -{product.discount}%
            </span>
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-background/70 backdrop-blur-[2px] flex items-center justify-center">
              <span className="rounded-full bg-destructive px-4 py-1.5 text-sm font-bold text-destructive-foreground uppercase tracking-widest">
                Agotado
              </span>
            </div>
          )}
        </div>

        {/* Textos y Acción de Compra */}
        <div className="flex flex-col justify-center">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            {product.category}
          </span>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            {product.name}
          </h1>

          {/* Precios */}
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-foreground">
              ${finalPrice.toLocaleString('es-UY', { minimumFractionDigits: 0 })}
            </span>
            {product.discount > 0 && (
              <span className="text-lg text-muted-foreground line-through">
                ${product.price.toLocaleString('es-UY', { minimumFractionDigits: 0 })}
              </span>
            )}
          </div>

          <p className="mt-6 text-base text-muted-foreground leading-relaxed whitespace-pre-line">
            {product.description}
          </p>

          <div className="mt-8 border-t border-border pt-6 flex flex-col gap-6">
            {/* Stock de Producto */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Box className="h-4 w-4" />
                Disponibilidad en taller:
              </span>
              <span className={`font-semibold ${isOutOfStock ? 'text-destructive' : product.stock <= 3 ? 'text-amber-500' : 'text-emerald-500'}`}>
                {isOutOfStock ? 'Sin Stock' : product.stock <= 3 ? `¡Últimas ${product.stock} unidades!` : `${product.stock} unidades`}
              </span>
            </div>

            {/* Acciones del Carrito si hay stock */}
            {!isOutOfStock && (
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                {/* Selector de cantidad */}
                <div className="flex items-center rounded-lg border border-border bg-card p-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleDecrease}
                    disabled={quantity <= 1}
                    className="h-8 w-8 rounded-md"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center text-sm font-semibold select-none">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleIncrease}
                    disabled={quantity >= product.stock}
                    className="h-8 w-8 rounded-md"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Botón Añadir */}
                <Button
                  onClick={handleAddToCart}
                  className="w-full sm:flex-1 gap-2 cursor-pointer transition-all duration-200"
                  size="lg"
                  variant={addedSuccessfully ? 'secondary' : 'default'}
                >
                  {addedSuccessfully ? (
                    <>
                      <Check className="h-5 w-5 text-emerald-500" />
                      <span>¡Añadido!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5" />
                      <span>Añadir al carrito</span>
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

