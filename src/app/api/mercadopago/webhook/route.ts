import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { mpClient } from '@/lib/mp';
import { Payment } from 'mercadopago';

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get('type') || url.searchParams.get('topic');
    
    // Buscar ID en query params
    let resourceId = url.searchParams.get('id') || url.searchParams.get('data.id');

    // Buscar ID en el cuerpo de la petición si no está en la URL
    if (!resourceId) {
      try {
        const body = await request.json();
        resourceId = body.data?.id || body.id;
      } catch (e) {
        // Ignorar error si no hay body
      }
    }

    // Solo procesamos si el tipo de notificación es un pago (payment)
    if (type === 'payment' && resourceId) {
      const paymentClient = new Payment(mpClient);
      
      // Consultar estado actual del pago en la API de Mercado Pago
      const payment = await paymentClient.get({ id: resourceId });

      if (payment.status === 'approved') {
        const orderId = payment.external_reference;

        if (orderId) {
          // Transacción de base de datos para idempotencia
          await db.$transaction(async (tx) => {
            const order = await tx.order.findUnique({
              where: { id: orderId },
              include: { items: true },
            });

            if (!order) {
              console.error(`Orden no encontrada para el pago: ${orderId}`);
              return;
            }

            // Prevenir doble descuento de stock (idempotencia)
            if (order.status !== 'PENDING') {
              console.log(`Orden ${orderId} ya procesada previamente. Estado: ${order.status}`);
              return;
            }

            // 1. Actualizar estado del pedido a PAID (el stock ya fue descontado en el checkout)
            await tx.order.update({
               where: { id: orderId },
               data: { status: 'PAID' },
             });
 
             console.log(`Webhook procesado exitosamente: Orden ${orderId} pagada.`);
           });
        }
      }
    }

    // Responder siempre con 200 OK a Mercado Pago para evitar reintentos de notificación
    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('Error al procesar webhook de Mercado Pago:', error);
    return new NextResponse('OK', { status: 200 }); // Retornar 200 para evitar loops en fallos persistentes
  }
}
