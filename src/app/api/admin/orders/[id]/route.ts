import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { z } from 'zod';

const statusSchema = z.object({
  status: z.enum(['PENDING', 'PAID', 'PRODUCTION', 'SHIPPED', 'CANCELLED']),
});

type RouteParams = {
  params: Promise<{ id: string }>;
};

// PUT: Actualizar el estado de un pedido
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

      // Determinar si debemos descontar stock (Transición de inactivo [PENDING, CANCELLED] a activo [PAID, PRODUCTION, SHIPPED])
      const shouldDecrement = 
        (oldStatus === 'PENDING' || oldStatus === 'CANCELLED') && 
        (newStatus === 'PAID' || newStatus === 'PRODUCTION' || newStatus === 'SHIPPED');

      // Determinar si debemos reponer/incrementar stock (Transición de activo [PAID, PRODUCTION, SHIPPED] a inactivo [PENDING, CANCELLED])
      const shouldIncrement = 
        (oldStatus === 'PAID' || oldStatus === 'PRODUCTION' || oldStatus === 'SHIPPED') && 
        (newStatus === 'PENDING' || newStatus === 'CANCELLED');

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

// DELETE: Eliminar un pedido cancelado
export async function DELETE(
  request: Request,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    // Verificar si existe la orden
    const existingOrder = await db.order.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
    }

    // Solo se permite eliminar pedidos cancelados
    if (existingOrder.status !== 'CANCELLED') {
      return NextResponse.json({ error: 'Solo se pueden eliminar pedidos cancelados' }, { status: 400 });
    }

    // Eliminar la orden. Las relaciones de OrderItem se eliminan en cascada gracias a onDelete: Cascade en schema.prisma
    await db.order.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Pedido eliminado correctamente' });
  } catch (error: any) {
    console.error('Error al eliminar pedido:', error);
    return NextResponse.json({ error: 'Error al eliminar el pedido', details: error.message }, { status: 500 });
  }
}
