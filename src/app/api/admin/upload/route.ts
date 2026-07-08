import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No se envió ningún archivo' }, { status: 400 });
    }

    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'El archivo debe ser una imagen' }, { status: 400 });
    }

    // Convertir el archivo a buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generar un nombre único
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExtension}`;

    // Subir al bucket 'product-images'
    const { data, error } = await supabaseAdmin.storage
      .from('product-images')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true
      });

    if (error) {
      console.error('Error al subir a Supabase Storage:', error);
      return NextResponse.json({ error: 'Error al subir la imagen al storage' }, { status: 500 });
    }

    // Obtener URL pública
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('product-images')
      .getPublicUrl(fileName);

    return NextResponse.json({ imageUrl: publicUrl });
  } catch (error) {
    console.error('Error en upload route:', error);
    return NextResponse.json({ error: 'Error interno en la carga del archivo' }, { status: 500 });
  }
}
