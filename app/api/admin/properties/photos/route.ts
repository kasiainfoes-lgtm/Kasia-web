import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/require-admin.server';
import { createAdminClient } from '@/lib/supabase/admin';

// Bucket público: cualquiera puede ver las fotos (son de un catálogo), pero
// solo un admin autenticado puede subir o borrar, siempre a través de esta
// ruta de servidor con la service_role key.
const BUCKET = 'property-photos';
const MAX_SIZE_BYTES = 8 * 1024 * 1024;
const ALLOWED_MIME: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
};

export async function POST(request: Request) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: 'Supabase no está configurado.' }, { status: 501 });

  const formData = await request.formData().catch(() => null);
  const file = formData?.get('file');

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 400 });
  }
  if (file.size === 0 || file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: 'La imagen debe pesar menos de 8 MB.' }, { status: 400 });
  }
  const extension = ALLOWED_MIME[file.type];
  if (!extension) {
    return NextResponse.json({ error: 'Solo se aceptan JPG, PNG o WEBP.' }, { status: 400 });
  }

  const path = `${randomUUID()}.${extension}`;
  const { error } = await admin.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    return NextResponse.json({ error: 'No pudimos subir la imagen. Inténtalo de nuevo.' }, { status: 500 });
  }

  const { data } = admin.storage.from(BUCKET).getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl });
}
