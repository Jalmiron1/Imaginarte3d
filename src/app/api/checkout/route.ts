import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { mpClient } from '@/lib/mp';
import { Preference } from 'mercadopago';
import { z } from 'zod';

const checkoutSchema = z.object({
  customerName: z.string().min(1, 'El nombre es obligatorio'),
  customerEmail: z.string().email('El correo electrónico no es válido'),
  customerPhone: z.string().min(1, 'El teléfono es obligatorio'),
  customerAddress: z.string().min(1, 'La dirección de envío es obligatoria'),
  paymentMethod: z.enum(['mercadopago', 'transfer']).default('mercadopago'),
  items: z.array(
    z.object({
      productId: z.string().uuid(),
      quantity: z.number().int().positive('La cantidad debe ser al menos 1'),
    })
  ).min(1, 'El carrito de compras no puede estar vacío'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = checkoutSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Datos de checkout inválidos', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { customerName, customerEmail, customerPhone, customerAddress, paymentMethod, items } = result.data;

    // 1. Obtener los productos correspondientes desde la base de datos
    const productIds = items.map((item) => item.productId);
    const dbProducts = await db.product.findMany({
      where: {
        id: { in: productIds },
      },
    });

    if (dbProducts.length !== items.length) {
      return NextResponse.json(
        { error: 'Uno o más productos del carrito no existen en nuestro catálogo' },
        { status: 400 }
      );
    }

    // Map para facilitar búsquedas de productos
    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    // 2. Validar stock de todos los productos y calcular total
    let total = 0;
    const verifiedItems: {
      productId: string;
      name: string;
      quantity: number;
      price: number;
    }[] = [];

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) continue;

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `El producto "${product.name}" no cuenta con suficiente stock (Disponible: ${product.stock}, Solicitado: ${item.quantity})` },
          { status: 400 }
        );
      }

      // El precio con descuento se calcula en el backend
      const discountPercentage = product.discount;
      const unitPriceAfterDiscount = product.price * (1 - discountPercentage / 100);
      const subtotal = unitPriceAfterDiscount * item.quantity;
      
      total += subtotal;

      verifiedItems.push({
        productId: product.id,
        name: product.name,
        quantity: item.quantity,
        price: unitPriceAfterDiscount,
      });
    }

    // 3. Crear orden de compra en estado PENDING y sus items asociados usando una transacción, y descontar stock inmediatamente
    const order = await db.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          customerName,
          customerEmail,
          customerPhone,
          customerAddress,
          total,
          status: 'PENDING',
        },
      });

      await tx.orderItem.createMany({
        data: verifiedItems.map((item) => ({
          orderId: newOrder.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
      });

      // Decrementar stock de los productos inmediatamente al crear el pedido
      for (const item of verifiedItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      return newOrder;
    });

    // 4. Si la forma de pago es transferencia bancaria, retornar éxito directamente
    if (paymentMethod === 'transfer') {
      return NextResponse.json({
        orderId: order.id,
        isTransfer: true,
      });
    }

    // 5. Crear la preferencia de pago en Mercado Pago
    const origin = request.headers.get('origin') || 'http://localhost:3000';
    const preference = new Preference(mpClient);

    // Mapear ítems para Mercado Pago
    const mpItems = verifiedItems.map((item) => ({
      id: item.productId,
      title: item.name,
      quantity: item.quantity,
      unit_price: Math.round(item.price * 100) / 100, // Redondear a 2 decimales
      currency_id: 'UYU',
    }));

    const response = await preference.create({
      body: {
        items: mpItems,
        back_urls: {
          success: `${origin}/checkout/success?orderId=${order.id}`,
          failure: `${origin}/checkout/failure?orderId=${order.id}`,
          pending: `${origin}/checkout/success?orderId=${order.id}`, // Tratamos pending similar a success temporalmente
        },
        auto_return: 'approved',
        external_reference: order.id, // Vincula el pago a esta orden
        notification_url: `${process.env.NEXT_PUBLIC_WEBHOOK_URL || origin}/api/mercadopago/webhook`, // webhook url
      },
    });

    // 5. Retornar el punto de inicio para el pago
    return NextResponse.json({
      orderId: order.id,
      initPoint: response.init_point,
      sandboxInitPoint: response.sandbox_init_point,
    });
  } catch (error: any) {
    console.error('Error en proceso de checkout:', error);
    return NextResponse.json(
      { error: 'Error procesando el checkout', details: error.message },
      { status: 500 }
    );
  }
}

