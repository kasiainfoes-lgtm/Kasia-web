import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { getAdminUser } from '@/lib/require-admin.server';
import { createAdminClient } from '@/lib/supabase/admin';

// Bucket público: cualquiera puede ver las fotos/videos (son de un catálogo),
// pero solo un admin autenticado puede subir o borrar, siempre a través de
// esta ruta de servidor con la service_role key.
const BUCKET = 'property-photos';
const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024;
const MAX_VIDEO_SIZE_BYTES = 50 * 1024 * 1024;
// Lado máximo con el que se guarda una foto. Más que esto no aporta nada en
// pantalla y multiplica el trabajo del servidor al mostrarla.
const MAX_IMAGE_DIMENSION = 2000;
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

  // Una foto de cámara o de móvil llega con 4000x3000 y varios MB. Guardarla
  // así obligaba al servidor a descargarla y redimensionarla entera en CADA
  // visita a la habitación, saturándolo. Se achica una sola vez, acá.
  let body: Blob | Buffer = file;
  let uploadPath = `${randomUUID()}.${extension}`;
  let uploadType = file.type;

  if (kind === 'image') {
    try {
      const resized = await sharp(Buffer.from(await file.arrayBuffer()))
        .rotate() // respeta la orientación EXIF de las fotos de móvil
        .resize({ width: MAX_IMAGE_DIMENSION, height: MAX_IMAGE_DIMENSION, fit: 'inside', withoutEnlargement: true })
        .flatten({ background: '#ffffff' }) // los PNG con transparencia no sirven como foto
        .jpeg({ quality: 82, mozjpeg: true })
        .toBuffer();
      body = resized;
      uploadPath = `${randomUUID()}.jpg`;
      uploadType = 'image/jpeg';
    } catch {
      // Si sharp no pudiera procesarla, se sube el original antes que perder la foto.
    }
  }

  const { error } = await admin.storage.from(BUCKET).upload(uploadPath, body, {
    contentType: uploadType,
    upsert: false,
  });

  if (error) {
    return NextResponse.json({ error: 'No pudimos subir el archivo. Inténtalo de nuevo.' }, { status: 500 });
  }

  const { data } = admin.storage.from(BUCKET).getPublicUrl(uploadPath);
  return NextResponse.json({ url: data.publicUrl });
}
