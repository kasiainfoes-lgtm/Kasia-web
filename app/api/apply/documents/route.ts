import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Bucket privado: solo la service_role key (este route handler) puede leer o
// escribir. No hace falta policy de RLS en storage.objects para anon.
const BUCKET = 'application-documents';
const ALLOWED_KINDS = new Set(['financial-proof', 'unpaid-rent-insurance']);
const MAX_SIZE_BYTES = 8 * 1024 * 1024;
const ALLOWED_MIME: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/png': 'png',
  'image/jpeg': 'jpg',
};

// Sube un documento del formulario de compatibilidad (/apply) antes de que
// exista la solicitud, así que no hay sesión de usuario todavía: se guarda
// con un nombre aleatorio y la ruta se manda de vuelta para que el cliente
// la incluya recién al enviar el formulario completo en /api/apply.
export async function POST(request: Request) {
  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json(
      { error: 'La subida de documentos no está disponible todavía.' },
      { status: 503 }
    );
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get('file');
  const kind = formData?.get('kind');

  if (!(file instanceof File) || typeof kind !== 'string' || !ALLOWED_KINDS.has(kind)) {
    return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 400 });
  }
  if (file.size === 0 || file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: 'El archivo debe pesar menos de 8 MB.' }, { status: 400 });
  }
  const extension = ALLOWED_MIME[file.type];
  if (!extension) {
    return NextResponse.json({ error: 'Solo se aceptan PDF, JPG o PNG.' }, { status: 400 });
  }

  const path = `${kind}/${randomUUID()}.${extension}`;
  const { error } = await admin.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    return NextResponse.json({ error: 'No pudimos subir el archivo. Intentá de nuevo.' }, { status: 500 });
  }

  return NextResponse.json({ path });
}
