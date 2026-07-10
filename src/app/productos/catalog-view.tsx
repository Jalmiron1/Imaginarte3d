'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductCard } from '@/components/product-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, SlidersHorizontal, Box } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discount: number;
  stock: number;
  category: string;
  imageUrl: string;
  createdAt: string;
}

interface CatalogViewProps {
  initialProducts: Product[];
}

export function CatalogView({ initialProducts }: CatalogViewProps) {
  const searchParams = useSearchParams();
  
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Ajustar la categoría si viene por URL (ej. ?category=Decoracion)
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  // Obtener categorías únicas presentes en la base de datos
  const categories = useMemo(() => {
    const cats = initialProducts.map((p) => p.category);
    return ['all', ...Array.from(new Set(cats))];
  }, [initialProducts]);

  // Filtrado reactivo en el cliente (búsqueda instantánea)
  const filteredProducts = useMemo(() => {
    return initialProducts.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.description.toLowerCase().includes(search.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [initialProducts, search, selectedCategory]);

  return (
    <div className="flex flex-col gap-6">
      {/* Barra de Filtros */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Campo de búsqueda */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o descripción..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 border-border bg-card text-foreground"
          />
        </div>

        {/* Categorías en Desktop */}
        <div className="hidden md:flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category)}
              className="capitalize cursor-pointer"
              size="sm"
            >
              {category === 'all' ? 'Todos' : category}
            </Button>
          ))}
        </div>

        {/* Categorías en Móvil */}
        <div className="md:hidden flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Filtrar Categoría</span>
          </label>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category)}
                className="capitalize shrink-0 cursor-pointer"
                size="sm"
              >
                {category === 'all' ? 'Todos' : category}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Listado de Productos */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl">
          <Box className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-semibold text-lg text-foreground">No se encontraron productos</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Intenta modificando tu término de búsqueda o cambiando el filtro.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {(() => {
            const newest5 = new Set(
              [...initialProducts]
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 5)
                .map(p => p.id)
            );
            return filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} isNew={newest5.has(product.id)} />
            ));
          })()}
        </div>
      )}
    </div>
  );
}
