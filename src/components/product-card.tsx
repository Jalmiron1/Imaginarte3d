'use client';

import React, { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useCart } from './cart-provider';
import { Button } from './ui/button';
import { ShoppingCart, Check } from 'lucide-react';

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
    createdAt?: string | Date;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const isOutOfStock = product.stock <= 0;
  const [added, setAdded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  // Separar imágenes si hay múltiples URLs
  const imageUrls = product.imageUrl.split(',');
  const primaryImageUrl = imageUrls[0] || '';

  // Calcular precio con descuento
  const finalPrice = product.price * (1 - product.discount / 100);

  // Determinar si el producto es nuevo (menos de 14 días desde su creación)
  const isNew = product.createdAt
    ? (Date.now() - new Date(product.createdAt).getTime()) < 14 * 24 * 60 * 60 * 1000
    : false;

  const handleAddToCart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (added) return;

    // 1. Lanzar la animación de "volar al carrito"
    const imgEl = imgRef.current;
    if (imgEl) {
      const imgRect = imgEl.getBoundingClientRect();

      // Encontrar el botón del carrito en la navbar
      const cartBtn = document.querySelector('[data-cart-btn]') as HTMLElement | null;
      const cartRect = cartBtn?.getBoundingClientRect();

      // Crear el clon que va a volar
      const clone = document.createElement('img');
      clone.src = primaryImageUrl;
      clone.className = 'fly-to-cart';
      clone.style.cssText = `
        width: ${imgRect.width}px;
        height: ${imgRect.height}px;
        top: ${imgRect.top + window.scrollY}px;
        left: ${imgRect.left}px;
        object-fit: contain;
        padding: 4px;
        background: var(--card);
        border: 1px solid var(--border);
      `;

      if (cartRect) {
        // Calcular el vector de desplazamiento hacia el carrito
        const destX = cartRect.left + cartRect.width / 2 - (imgRect.left + imgRect.width / 2);
        const destY = (cartRect.top + window.scrollY) + cartRect.height / 2 - (imgRect.top + window.scrollY + imgRect.height / 2);
        clone.style.setProperty('--fly-x', `${destX}px`);
        clone.style.setProperty('--fly-y', `${destY}px`);
      } else {
        clone.style.setProperty('--fly-x', '50vw');
        clone.style.setProperty('--fly-y', '-80vh');
      }

      document.body.appendChild(clone);

      // Hacer bounce en el carrito al llegar
      clone.addEventListener('animationend', () => {
        clone.remove();
        if (cartBtn) {
          cartBtn.classList.add('cart-bounce');
          cartBtn.addEventListener('animationend', () => {
            cartBtn.classList.remove('cart-bounce');
          }, { once: true });
        }
      }, { once: true });
    }

    // 2. Agregar al carrito real
    addToCart(
      {
        productId: product.id,
        name: product.name,
        price: product.price,
        discount: product.discount,
        imageUrl: primaryImageUrl,
        maxStock: product.stock,
      },
      1
    );

    // 3. Estado visual de confirmación en el botón
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }, [added, addToCart, primaryImageUrl, product]);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md hover:border-muted-foreground/30">
      {/* Contenedor de la Imagen */}
      <Link href={`/productos/${product.id}`} className="relative aspect-square overflow-hidden bg-muted block">
        <img
          ref={imgRef}
          src={primaryImageUrl}
          alt={product.name}
          className="h-full w-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {/* Badge Nuevo */}
        {isNew && !isOutOfStock && (
          <span className="absolute top-2 right-2 rounded-full bg-gradient-to-r from-[#FF6FA5] to-[#FFD39A] px-2.5 py-0.5 text-[10px] font-black text-white shadow-md uppercase tracking-widest animate-pulse">
            Nuevo
          </span>
        )}
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
          <h3 className="font-semibold text-base line-clamp-1 hover:text-primary transition-colors">
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

        {/* Botón de Agregar */}
        <div className="mt-4">
          <Button
            ref={btnRef}
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`w-full gap-2 transition-all cursor-pointer ${added ? 'bg-emerald-500 hover:bg-emerald-500 scale-95' : ''}`}
            variant={isOutOfStock ? 'secondary' : 'default'}
          >
            {added ? (
              <>
                <Check className="h-4 w-4" />
                ¡Agregado!
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4" />
                {isOutOfStock ? 'Agotado' : 'Añadir al carrito'}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
