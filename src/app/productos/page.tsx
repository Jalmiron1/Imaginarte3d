import db from '@/lib/db';
import { CatalogView } from './catalog-view';
import { Suspense } from 'react';

export const revalidate = 0; // Datos siempre actualizados de Supabase

export default async function ProductosPage() {
  let products: any[] = [];
  try {
    products = (await db.product.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })).map(p => ({ ...p, createdAt: p.createdAt.toISOString() }));
  } catch (error) {
    console.error('Error al obtener el catálogo:', error);
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Catálogo de Productos</h1>
        <p className="text-sm text-muted-foreground mt-1">Explora nuestras impresiones y encuentra tu modelo favorito</p>
      </div>

      <Suspense fallback={<div className="text-center py-12 text-sm text-muted-foreground">Cargando catálogo...</div>}>
        <CatalogView initialProducts={products} />
      </Suspense>
    </div>
  );
}
