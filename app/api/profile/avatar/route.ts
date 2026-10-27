import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { getSessionUser } from '@/lib/supabase/session.server';
import { createAdminClient } from '@/lib/supabase/admin';

// Bucket público (como property-photos): cualquiera puede ver una foto de
// perfil (aparece en /asesores/[email] para los propietarios, por ejemplo),
// pero solo la propia persona puede subir o cambiar la suya.
const BUCKET = 'avatars';
const MAX_SIZE_BYTES = 10 * 1024 * 1024;
const AVATAR_SIDE = 400;
const ALLOWED_MIME: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
};

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: 'Supabase no está configurado.' }, { status: 501 });

  const formData = await request.formData().catch(() => null);
  const file = formData?.get('file');

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 400 });
  }
  if (!ALLOWED_MIME[file.type]) {
    return NextResponse.json({ error: 'Solo se aceptan JPG, PNG o WEBP.' }, { status: 400 });
  }
  if (file.size === 0 || file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: 'La imagen debe pesar menos de 10 MB.' }, { status: 400 });
  }

  let body: Buffer;
  try {
    body = await sharp(Buffer.from(await file.arrayBuffer()))
      .rotate()
      .resize({ width: AVATAR_SIDE, height: AVATAR_SIDE, fit: 'cover', position: 'attention' })
      .flatten({ background: '#ffffff' })
      .jpeg({ quality: 85, mozjpeg: true })
      .toBuffer();
  } catch {
    return NextResponse.json({ error: 'No pudimos procesar esa imagen. Prueba con otra.' }, { status: 400 });
  }

  const uploadPath = `${user.id}/${randomUUID()}.jpg`;
  const { error: uploadError } = await admin.storage.from(BUCKET).upload(uploadPath, body, {
    contentType: 'image/jpeg',
    upsert: false,
  });
  if (uploadError) {
    return NextResponse.json({ error: 'No pudimos subir la imagen. Inténtalo de nuevo.' }, { status: 500 });
  }

  const { data } = admin.storage.from(BUCKET).getPublicUrl(uploadPath);

  const { error: updateError } = await admin
    .from('profiles')
    .upsert({ id: user.id, avatar_url: data.publicUrl }, { onConflict: 'id' });
  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ url: data.publicUrl });
}
