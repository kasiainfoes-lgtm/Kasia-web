import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getApprovedUser } from '@/lib/require-approved.server';
import { fetchRoomById } from '@/lib/properties.server';
import { sendEmail } from '@/lib/email.server';
import { transferProofSubmittedNotificationEmailTemplate } from '@/lib/email-templates';
import { resolveSiteUrl } from '@/lib/site-url';

// Bucket privado: solo la service_role key (este route handler) puede leer o
// escribir, igual que application-documents. El comprobante lo sube quien ya
// tiene sesión y perfil aprobado, así que la escritura del booking en sí pasa
// por el cliente atado a la sesión (respeta la policy "users manage their own
// bookings"), y solo la subida al storage usa la service_role key.
const BUCKET = 'payment-proofs';
const MAX_SIZE_BYTES = 8 * 1024 * 1024;
const ALLOWED_MIME: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
};

export async function POST(request: Request) {
  const access = await getApprovedUser();
  if (!access) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  const supabase = createClient();
  const admin = createAdminClient();
  if (!supabase || !admin) {
    return NextResponse.json({ error: 'Supabase no está configurado.' }, { status: 501 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get('file');
  const roomId = formData?.get('roomId');
  if (!(file instanceof File) || typeof roomId !== 'string' || !roomId) {
    return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 400 });
  }

  const extension = ALLOWED_MIME[file.type];
  if (!extension) {
    return NextResponse.json({ error: 'Solo se aceptan JPG, PNG, WEBP o PDF.' }, { status: 400 });
  }
  if (file.size === 0 || file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: 'El archivo debe pesar menos de 8 MB.' }, { status: 400 });
  }

  const room = await fetchRoomById(roomId);
  if (!room) return NextResponse.json({ error: 'Habitación no encontrada.' }, { status: 404 });

  const path = `${access.userId}/${randomUUID()}.${extension}`;
  const { error: uploadError } = await admin.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (uploadError) {
    return NextResponse.json({ error: 'No pudimos subir el comprobante. Probá de nuevo.' }, { status: 500 });
  }

  const { error } = await supabase.from('bookings').upsert(
    {
      room_id: roomId,
      user_id: access.userId,
      user_email: access.email,
      status: 'revision',
      transfer_proof_path: path,
      transfer_proof_submitted_at: new Date().toISOString(),
      transfer_review_rejected_at: null,
      transfer_review_rejection_note: null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'room_id,user_id' }
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Best-effort: si Resend falla, el comprobante ya quedó guardado igual.
  try {
    const adminEmails = (process.env.ADMIN_EMAILS ?? '')
      .split(',')
      .map((e) => e.trim())
      .filter(Boolean);
    if (adminEmails.length > 0) {
      const siteUrl = resolveSiteUrl(request);
      const { subject, html } = transferProofSubmittedNotificationEmailTemplate(
        access.email ?? 'un usuario',
        room.title,
        `${siteUrl}/admin`
      );
      await sendEmail({ to: adminEmails, subject, html });
    }
  } catch {
    // best-effort, ver comentario arriba
  }

  return NextResponse.json({ ok: true });
}
