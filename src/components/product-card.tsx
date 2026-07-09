'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from './cart-provider';
import { Button } from './ui/button';
import { ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    discount: number;
    stock: number;
    category: string;
    imageUrl: string;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const isOutOfStock = product.stock <= 0;

  // Calcular precio con descuento
  const finalPrice = product.price * (1 - product.discount / 100);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(
      {
        productId: product.id,
        name: product.name,
        price: product.price,
        discount: product.discount,
        imageUrl: product.imageUrl,
        maxStock: product.stock,
      },
      1
    );
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md hover:border-muted-foreground/30">
      {/* Contenedor de la Imagen */}
      <Link href={`/productos/${product.id}`} className="relative aspect-square overflow-hidden bg-muted block">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {product.discount > 0 && (
          <span className="absolute top-2 left-2 rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white shadow-sm animate-pulse">
            -{product.discount}%
          </span>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-[1px]">
            <span className="rounded-full bg-destructive px-3 py-1 text-xs font-bold text-destructive-foreground uppercase tracking-wider">
              Agotado
            </span>
          </div>
        )}
      </Link>

      {/* Detalles del Producto */}
      <div className="flex flex-1 flex-col p-4">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {product.category}
        </span>
        <Link href={`/productos/${product.id}`} className="mt-1 block">
          <h3 className="font-semibold text-base line-clamp-1 hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="mt-1 text-xs text-muted-foreground line-clamp-2 flex-1">
          {product.description}
        </p>

        {/* Precios */}
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-lg font-bold text-foreground">
            ${finalPrice.toLocaleString('es-UY', { minimumFractionDigits: 0 })}
          </span>
          {product.discount > 0 && (
            <span className="text-xs text-muted-foreground line-through">
              ${product.price.toLocaleString('es-UY', { minimumFractionDigits: 0 })}
            </span>
          )}
        </div>

        {/* BotÃ³n de Agregar */}
        <div className="mt-4">
          <Button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="w-full gap-2 transition-all cursor-pointer"
            variant={isOutOfStock ? 'secondary' : 'default'}
          >
            <ShoppingCart className="h-4 w-4" />
            {isOutOfStock ? 'Agotado' : 'AÃ±adir al carrito'}
          </Button>
        </div>
      </div>
    </div>
  );
}

