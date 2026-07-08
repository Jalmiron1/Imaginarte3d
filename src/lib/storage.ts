import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Sube una imagen al bucket "product-images" y devuelve la URL pública.
 * @param file Archivo seleccionado por el usuario.
 */
export async function uploadProductImage(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random()
    .toString(36)
    .substring(2)}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(fileName, file, { upsert: false });

  if (error) throw error;

  // Bucket público → URL directa
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${fileName}`;
}
