# Imaginarte3D - E-commerce de Impresiones 3D

Este es un e-commerce completo para la venta de impresiones 3D, desarrollado con Next.js 14 (App Router), Tailwind CSS, Shadcn/ui, Prisma, PostgreSQL (Supabase) y Mercado Pago.

## Características

*   **Páginas Públicas**: Inicio con destacados, Catálogo con búsqueda y filtros, Detalle del producto, Carrito de compras y Checkout integrado con Mercado Pago.
*   **Almacenamiento**: Subida directa de imágenes de productos a Supabase Storage Buckets.
*   **Panel de Administración**: Dashboard con métricas clave, CRUD de productos, y gestión del estado de los pedidos.
*   **Seguridad**: Autenticación de admin protegida por cookies cifradas y Middleware.

## Requisitos de Configuración

Copia el archivo `.env.example` a `.env` y rellena las variables de entorno necesarias.

## Desarrollo

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Inicializar la base de datos de Prisma y poblarla:
   ```bash
   npx prisma db push
   npx prisma db seed
   ```
3. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```
