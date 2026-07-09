import Link from 'next/link';
import db from '@/lib/db';
import { ProductCard } from '@/components/product-card';
import { ArrowRight, Box, Compass, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const revalidate = 0; // Evitar almacenamiento en caché para datos dinámicos de Supabase

export default async function HomePage() {
  let products: any[] = [];
  try {
    products = await db.product.findMany({
      take: 4,
      orderBy: {
        createdAt: 'desc',
      },
    });
  } catch (error) {
    console.error('Error al obtener productos en la Home:', error);
  }

  return (
    <div className="flex flex-col gap-12 pb-12">
      {/* Sección Hero */}
      <section className="relative overflow-hidden py-20 text-center sm:py-32 bg-background text-foreground">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/15 via-background to-background" />
        <div className="container mx-auto px-4 relative z-10 flex flex-col items-center gap-6 max-w-4xl">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5 animate-pulse text-primary" />
            <span>Nuevos lanzamientos y diseños 3D únicos</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-balance">
            Materializamos tus ideas en <span className="bg-gradient-to-r from-[#FF6FA5] to-[#FFD39A] bg-clip-text text-transparent">Impresión 3D</span>
          </h1>
          <p className="text-lg text-slate-300 text-balance max-w-2xl">
            Explora nuestro catálogo de productos de alta precisión. Figuras articuladas, decoración para el hogar y accesorios impresos con plásticos ecológicos.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            <Link href="/productos">
              <Button size="lg" className="gap-2 font-medium cursor-pointer shadow-[0_0_15px_rgba(255,111,165,0.3)]">
                Ver Catálogo Completo
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/productos?category=Decoración">
              <Button size="lg" variant="outline" className="cursor-pointer border-slate-700 text-slate-300 hover:bg-slate-900 hover:text-white">
                Decoración
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Sección de Productos Destacados */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between border-b border-border pb-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Productos Destacados</h2>
            <p className="text-sm text-muted-foreground mt-1">Los 4 diseños más recientes del taller</p>
          </div>
          <Link href="/productos" className="text-sm font-semibold text-primary hover:text-primary/80 flex items-center gap-1">
            Ver todo
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-xl">
            <Box className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-semibold text-lg text-foreground">Sin productos activos</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Aún no hay productos en la tienda. Si eres administrador, configúrate en el panel.
            </p>
            <Link href="/admin">
              <Button variant="outline" size="sm" className="mt-4 cursor-pointer">
                Iniciar Sesión de Administrador
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Sección de Beneficios de Negocio */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 border-t border-border pt-12 mt-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="flex flex-col items-center text-center p-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
              <Box className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">PLA Biodegradable</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Todas nuestras piezas se imprimen en PLA de origen vegetal, respetuoso con el medio ambiente.
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">Resolución Fina</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Calidad de extrusión controlada para obtener capas uniformes y la máxima resistencia estructural.
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
              <Compass className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">Pago con Mercado Pago</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Paga con tarjeta de débito, crédito o saldo en Mercado Pago con total seguridad y de forma inmediata.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
