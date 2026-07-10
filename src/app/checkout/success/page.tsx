import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

type PageProps = {
  searchParams: Promise<{ orderId?: string; paymentMethod?: string }>;
};

export default async function SuccessPage({ searchParams }: PageProps) {
  const { orderId, paymentMethod } = await searchParams;
  const isTransfer = paymentMethod === 'transfer';

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '59899123456';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    `Hola Imaginarte 3D, aquí está el comprobante de mi transferencia bancaria para el pedido con ID: ${orderId || ''}.`
  )}`;

  return (
    <div className="container mx-auto px-4 py-16 text-center max-w-lg flex flex-col items-center gap-6">
      <div className="h-16 w-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-600">
        <CheckCircle className="h-10 w-10 animate-bounce" />
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
        {isTransfer ? '¡Pedido Registrado!' : '¡Pago Exitoso!'}
      </h1>
      <p className="text-sm text-muted-foreground -mt-2">
        {isTransfer 
          ? 'Tu pedido se ha registrado correctamente. Completa la transferencia para iniciar con la impresión.' 
          : 'Tu pedido ha sido procesado de manera correcta. Ya estamos preparando tu diseño para comenzar la impresión en nuestro taller.'}
      </p>

      {isTransfer && (
        <div className="w-full text-left rounded-xl border border-border bg-card p-5 space-y-4 shadow-md">
          <h3 className="font-bold text-sm text-primary uppercase tracking-wider">
            Datos de Transferencia Bancaria
          </h3>
          <div className="space-y-2 text-sm text-foreground">
            <div>
              <span className="text-xs text-muted-foreground block">Banco</span>
              <strong className="font-semibold">Banco Itaú</strong>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Cuenta (Caja de Ahorros $)</span>
              <strong className="font-semibold">9876543</strong>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Titular</span>
              <strong className="font-semibold">Imaginarte 3D</strong>
            </div>
            {orderId && (
              <div>
                <span className="text-xs text-muted-foreground block">Referencia del Pago</span>
                <strong className="font-semibold font-mono">{orderId.slice(0, 8)}...</strong>
              </div>
            )}
          </div>
          <div className="text-xs text-amber-500 bg-amber-500/10 p-3 rounded-lg border border-amber-500/20 leading-relaxed">
            <strong>Importante:</strong> Envía el comprobante de la transferencia a nuestro WhatsApp junto con tu nombre para comenzar la producción de tu pieza 3D.
          </div>
          <div className="pt-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-500 shadow-md transition-all cursor-pointer hover:shadow-emerald-500/20"
            >
              Enviar comprobante por WhatsApp
            </a>
          </div>
        </div>
      )}

      {orderId && (
        <div className="rounded-lg bg-muted px-4 py-2.5 text-xs font-mono text-muted-foreground border border-border w-full">
          ID de Pedido: {orderId}
        </div>
      )}
      <div className="flex flex-col gap-2 w-full mt-2">
        <Link href="/productos">
          <Button className="w-full cursor-pointer text-primary-foreground">Volver al Catálogo</Button>
        </Link>
        <Link href="/">
          <Button variant="ghost" className="w-full cursor-pointer text-muted-foreground">Ir a Inicio</Button>
        </Link>
      </div>
    </div>
  );
}
