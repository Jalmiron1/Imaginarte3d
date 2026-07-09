import db from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingBag, ClipboardList, DollarSign } from 'lucide-react';

export const revalidate = 0; // Cargar siempre datos en tiempo real

export default async function AdminDashboardPage() {
  let productCount = 0;
  let orderCount = 0;
  let estimatedRevenue = 0;

  try {
    productCount = await db.product.count();
    orderCount = await db.order.count();
    
    // Suma de ingresos por pedidos aprobados (PAID) o enviados (SHIPPED)
    const revenueAggregate = await db.order.aggregate({
      where: {
        status: { in: ['PAID', 'SHIPPED'] },
      },
      _sum: {
        total: true,
      },
    });
    estimatedRevenue = revenueAggregate._sum.total || 0;
  } catch (error) {
    console.error('Error al calcular métricas en admin dashboard:', error);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Resumen de Métricas</h1>
        <p className="text-sm text-muted-foreground mt-1">Control rápido del volumen de negocio</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {/* Ingresos Acreditados */}
        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Ingresos Totales Acreditados
            </CardTitle>
            <DollarSign className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-foreground">
              ${estimatedRevenue.toLocaleString('es-UY', { minimumFractionDigits: 0 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Excluye órdenes canceladas y pendientes</p>
          </CardContent>
        </Card>

        {/* Órdenes Totales */}
        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Total de Pedidos
            </CardTitle>
            <ClipboardList className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-foreground">
              {orderCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Registros totales en base de datos</p>
          </CardContent>
        </Card>

        {/* Productos Activos */}
        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Productos en Catálogo
            </CardTitle>
            <ShoppingBag className="h-5 w-5 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-foreground">
              {productCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Modelos 3D activos e inactivos</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

