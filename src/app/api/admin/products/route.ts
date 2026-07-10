import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { z } from 'zod';

const productSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  description: z.string().min(1, 'La descripción es obligatoria'),
  price: z.number().positive('El precio debe ser un número positivo'),
  discount: z.number().min(0).max(100).default(0),
  stock: z.number().int().nonnegative('El stock debe ser no negativo'),
  category: z.string().min(1, 'La categoría es obligatoria'),
  imageUrl: z.string().min(1, 'La URL de la imagen es obligatoria'),
});

// GET: Listar todos los productos (sección admin o público)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    
    // Filtros de búsqueda opcionales
    const where: any = {};
    if (category && category !== 'all') {
      where.category = category;
    }
    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      };
    }

    const products = await db.product.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    return NextResponse.json({ error: 'Error al obtener los productos' }, { status: 500 });
  }
}

// POST: Crear un nuevo producto (protegido por middleware)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = productSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const product = await db.product.create({
      data: result.data,
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error al crear producto:', error);
    return NextResponse.json({ error: 'Error al crear el producto' }, { status: 500 });
  }
}
