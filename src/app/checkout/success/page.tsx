import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

type PageProps = {
  searchParams: Promise<{ orderId?: string }>;
};

export default async function SuccessPage({ searchParams }: PageProps) {
  const { orderId } = await searchParams;

  return (
    <div className="container mx-auto px-4 py-20 text-center max-w-md flex flex-col items-center gap-6">
      <div className="h-16 w-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-600">
        <CheckCircle className="h-10 w-10 animate-bounce" />
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground">¡Pago Exitoso!</h1>
      <p className="text-sm text-muted-foreground -mt-2">
        Tu pedido ha sido procesado de manera correcta. Ya estamos preparando tu diseño para comenzar la impresión en nuestro taller.
      </p>
      {orderId && (
        <div className="rounded-lg bg-muted px-4 py-2.5 text-xs font-mono text-muted-foreground border border-border">
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
