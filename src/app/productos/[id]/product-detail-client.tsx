'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/components/cart-provider';
import { Button } from '@/components/ui/button';
import { ShoppingCart, ArrowLeft, Minus, Plus, Box, Check, ChevronLeft, ChevronRight } from 'lucide-react';

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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = product.imageUrl.split(',');

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
        imageUrl: images[0],
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
        {/* Imagen del Producto (con soporte de carrusel) */}
        <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-muted flex items-center justify-center group/carousel">
          <img
            src={images[currentImageIndex]}
            alt={product.name}
            className="h-full w-full object-contain p-4 transition-all duration-300"
          />
          
          {images.length > 1 && (
            <>
              {/* Botón Izquierdo */}
              <button
                onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background border border-border p-1.5 rounded-full text-foreground opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-200 cursor-pointer shadow-sm flex items-center justify-center"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {/* Botón Derecho */}
              <button
                onClick={() => setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background border border-border p-1.5 rounded-full text-foreground opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-200 cursor-pointer shadow-sm flex items-center justify-center"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              {/* Indicadores */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 bg-background/60 backdrop-blur-xs px-2.5 py-1 rounded-full border border-border/50">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`h-2 w-2 rounded-full transition-all cursor-pointer ${
                      index === currentImageIndex ? 'bg-primary w-4' : 'bg-muted-foreground/50 hover:bg-muted-foreground'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

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
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
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

