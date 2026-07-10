import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { z } from 'zod';

const statusSchema = z.object({
  status: z.enum(['PENDING', 'PAID', 'SHIPPED', 'CANCELLED']),
});

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function PUT(
  request: Request,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = statusSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Estado de orden no válido' }, { status: 400 });
    }

    const updatedOrder = await db.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!order) {
        return null;
      }

      const oldStatus = order.status;
      const newStatus = result.data.status;

      // Si el estado es idéntico, solo retornamos la orden
      if (oldStatus === newStatus) {
        return order;
      }

      // Determinar si debemos descontar stock (Transición de CANCELLED a un estado activo)
      const shouldDecrement = 
        oldStatus === 'CANCELLED' && 
        (newStatus === 'PENDING' || newStatus === 'PAID' || newStatus === 'SHIPPED');

      // Determinar si debemos reponer/incrementar stock (Transición de estado activo a CANCELLED)
      const shouldIncrement = 
        (oldStatus === 'PENDING' || oldStatus === 'PAID' || oldStatus === 'SHIPPED') && 
        newStatus === 'CANCELLED';

      // Actualizar la orden
      const updated = await tx.order.update({
        where: { id },
        data: { status: newStatus },
      });

      // Ejecutar ajustes de stock en base de datos
      if (shouldDecrement) {
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        }
      } else if (shouldIncrement) {
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                increment: item.quantity,
              },
            },
          });
        }
      }

      return updated;
    });

    if (!updatedOrder) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Error al actualizar orden:', error);
    return NextResponse.json({ error: 'Error al actualizar el estado de la orden' }, { status: 500 });
  }
}
