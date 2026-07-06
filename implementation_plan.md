ACTÚA COMO UN EQUIPO DE DESARROLLADORES SENIOR DE NEXT.JS.

Necesito que generes el código completo de un ecommerce para venta de impresiones 3D con las siguientes características TÉCNICAS Y DE NEGOCIO exactas:

## STACK OBLIGATORIO
- Next.js 14 con App Router y TypeScript.
- Tailwind CSS + Shadcn/ui para los componentes (instálalos con el CLI).
- Prisma como ORM con PostgreSQL (usa @prisma/client).
- MercadoPago como pasarela de pago (SDK oficial).
- Cookies para sesión de admin (next/headers).
- LocalStorage para el carrito de invitados.

## FUNCIONALIDADES DE LA TIENDA (FRONTEND PÚBLICO)
1. Página de inicio con los productos destacados (los 4 más recientes).
2. Página de listado de productos con filtro por categorías y buscador.
3. Página de detalle de producto con:
   - Imagen, nombre, descripción, precio (con descuento tachado si aplica).
   - Selector de cantidad.
   - Botón "Añadir al carrito" (guarda en localStorage).
4. Carrito de compras (ruta /carrito):
   - Lista de productos añadidos con cantidad y subtotal.
   - Botón para vaciar carrito.
   - Botón "Proceder al pago" que redirige a formulario de checkout.
5. Checkout (formulario en la misma página del carrito o en /checkout):
   - Campos: Nombre completo, Email, Teléfono, Dirección.
   - Resumen del pedido con total.
   - Al enviar: crea la orden en DB con estado PENDING, genera preferencia en MP y redirige al checkout de MP.
6. Página de éxito/fracaso después de pagar (actualiza estado vía webhook).
7. TODAS las páginas deben ser responsivas (mobile first).

## PANEL DE ADMINISTRADOR (RUTA /admin)
- Protegida por cookie de sesión (login con contraseña fija en .env).
- Dashboard: muestra el total de pedidos y productos (sin gráficas, solo números).
- Gestión de productos:
   - Listado con paginación y botones Editar/Eliminar.
   - Formulario para crear/editar: Nombre, Descripción (textarea), Precio (number), Descuento (% opcional), Stock (number), Categoría (select o input), Imagen (subida a Cloudinary o URL directa).
   - Al eliminar, pedir confirmación con modal.
- Gestión de pedidos:
   - Listado de todas las órdenes con: ID, Cliente, Total, Estado, Fecha.
   - Selector para cambiar estado: PENDING → PAID → SHIPPED → CANCELLED.
   - Botón para ver detalle del pedido (productos comprados).

## LÓGICA DE NEGOCIO (IMPORTANTE)
- Los descuentos son porcentajes aplicados por producto. Si un producto tiene discount: 15, el precio final es price * (1 - discount/100).
- El precio final con descuento se calcula en el frontend para mostrar, pero el backend recalcula y valida antes de crear la orden (nunca confiar en el frontend).
- Al pagar, el stock se descuenta SOLO cuando el webhook de MP confirma el pago (no al crear la orden).
- Si el stock llega a 0, el producto debe mostrarse como "Agotado" en la tienda y no permitir añadir al carrito.
- El carrito se guarda en localStorage con clave "cart_3d". Cada item debe tener: productId, name, price, discount, quantity, imageUrl, maxStock.
- Al hacer checkout, se envía el carrito al backend, se valida que todos los productos existan y tengan stock suficiente, se calcula el total, se crea la orden y la preferencia de MP.

## SEGURIDAD
- Variables de entorno obligatorias: DATABASE_URL, ADMIN_PASSWORD, MERCADOPAGO_ACCESS_TOKEN, NEXT_PUBLIC_MP_PUBLIC_KEY, NEXTAUTH_SECRET (o similar para cifrar cookies).
- Middleware en Next.js para proteger /admin/* y redirigir a login si no hay cookie.
- Validación de datos con Zod en todas las API routes.
- En el webhook de MP, verificar el origen de la petición (usar el secret de MP).

## CONFIGURACIÓN INICIAL
- Incluye el schema.prisma completo (con los modelos Product, Order, OrderItem).
- Incluye un script de seed con 5 productos de ejemplo (impresiones 3D: "Dragón articulado", "Maceta geométrica", "Llavero personalizado", "Miniatura de D&D", "Soporte para auriculares").
- Incluye el archivo .env.example con todas las variables necesarias.

## INSTRUCCIONES DE DESPLIEGUE
- Explica cómo desplegar en Vercel.
- Explica cómo configurar Supabase como base de datos.
- Explica cómo configurar el webhook de MercadoPago (URL pública + endpoint /api/mercadopago/webhook).

---

## FORMATO DE SALIDA ESPERADO
Quiero que generes el código completo, organizado por carpetas, con explicaciones breves al inicio de cada archivo. Prioriza el código funcional sobre explicaciones largas. Si algún archivo es muy largo, indícalo con comentarios de "// CONTINUARÁ" pero asegúrate de que todo el proyecto esté cubierto.

No omitas el middleware, el layout principal, ni la configuración de Prisma.
Antes de empezar a codificar, confírmame que entiendes todos los requisitos y dime qué archivos vas a generar primero. Prefiero que me des el código por partes si es muy extenso, pero que esté completo.