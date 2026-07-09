import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';

type PageProps = {
  searchParams: Promise<{ orderId?: string }>;
};

export default async function FailurePage({ searchParams }: PageProps) {
  const { orderId } = await searchParams;

  return (
    <div className="container mx-auto px-4 py-20 text-center max-w-md flex flex-col items-center gap-6">
      <div className="h-16 w-16 bg-destructive/10 rounded-full flex items-center justify-center text-destructive">
        <XCircle className="h-10 w-10 animate-pulse" />
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Pago Cancelado o Fallido</h1>
      <p className="text-sm text-muted-foreground -mt-2">
        No pudimos completar el cobro de tu compra en Mercado Pago. Ningún cargo fue realizado en tus tarjetas o cuenta.
      </p>
      {orderId && (
        <div className="rounded-lg bg-muted px-4 py-2.5 text-xs font-mono text-muted-foreground border border-border">
          Código de Pedido: {orderId}
        </div>
      )}
      <div className="flex flex-col gap-2 w-full mt-2">
        <Link href="/carrito">
          <Button className="w-full cursor-pointer text-primary-foreground">Intentar de nuevo</Button>
        </Link>
        <Link href="/productos">
          <Button variant="ghost" className="w-full cursor-pointer text-muted-foreground">Volver al Catálogo</Button>
        </Link>
      </div>
    </div>
  );
}
