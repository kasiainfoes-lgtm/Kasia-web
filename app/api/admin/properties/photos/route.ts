import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/require-admin.server';
import { createAdminClient } from '@/lib/supabase/admin';

// Bucket público: cualquiera puede ver las fotos/videos (son de un catálogo),
// pero solo un admin autenticado puede subir o borrar, siempre a través de
// esta ruta de servidor con la service_role key.
const BUCKET = 'property-photos';
const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024;
const MAX_VIDEO_SIZE_BYTES = 50 * 1024 * 1024;
const ALLOWED_MIME: Record<string, { extension: string; kind: 'image' | 'video' }> = {
  'image/png': { extension: 'png', kind: 'image' },
  'image/jpeg': { extension: 'jpg', kind: 'image' },
  'image/webp': { extension: 'webp', kind: 'image' },
  'video/mp4': { extension: 'mp4', kind: 'video' },
  'video/quicktime': { extension: 'mov', kind: 'video' },
  'video/webm': { extension: 'webm', kind: 'video' },
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
  const allowed = ALLOWED_MIME[file.type];
  if (!allowed) {
    return NextResponse.json({ error: 'Solo se aceptan JPG, PNG, WEBP, MP4, MOV o WEBM.' }, { status: 400 });
  }
  const { extension, kind } = allowed;
  const maxSize = kind === 'video' ? MAX_VIDEO_SIZE_BYTES : MAX_IMAGE_SIZE_BYTES;
  if (file.size === 0 || file.size > maxSize) {
    return NextResponse.json(
      { error: `El archivo debe pesar menos de ${Math.round(maxSize / (1024 * 1024))} MB.` },
      { status: 400 }
    );
  }

  const path = `${randomUUID()}.${extension}`;
  const { error } = await admin.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    return NextResponse.json({ error: 'No pudimos subir el archivo. Inténtalo de nuevo.' }, { status: 500 });
  }

  const { data } = admin.storage.from(BUCKET).getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl });
}
