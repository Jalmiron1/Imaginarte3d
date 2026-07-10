import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { z } from 'zod';

const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().positive(),
  discount: z.number().min(0).max(100),
  stock: z.number().int().nonnegative(),
  category: z.string().min(1),
  imageUrl: z.string().url(),
});

type RouteParams = {
  params: Promise<{ id: string }>;
};

// PUT: Actualizar un producto existente
export async function PUT(
  request: Request,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = productSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Verificar si existe el producto
    const existingProduct = await db.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }

    const updatedProduct = await db.product.update({
      where: { id },
      data: result.data,
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    return NextResponse.json({ error: 'Error al actualizar el producto' }, { status: 500 });
  }
}

// DELETE: Eliminar un producto
export async function DELETE(
  request: Request,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    // Verificar si existe el producto
    const existingProduct = await db.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }

    // Eliminar primero las relaciones de OrderItem asociadas para evitar errores de restricción de clave foránea (FK constraint) en la base de datos
    await db.orderItem.deleteMany({
      where: { productId: id },
    });

    await db.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Producto eliminado correctamente' });
  } catch (error: any) {
    console.error('Error al eliminar producto:', error);
    return NextResponse.json({ error: 'Error al eliminar el producto', details: error.message }, { status: 500 });
  }
}
