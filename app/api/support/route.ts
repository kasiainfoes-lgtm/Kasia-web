import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email.server';
import { supportRequestEmailTemplate } from '@/lib/email-templates';

// Bandeja fija de soporte técnico — no es la misma lista que ADMIN_EMAILS
// (que es para notificaciones operativas tipo "nuevo pago"), así que va
// directo acá en vez de mezclarse con esa configuración.
const SUPPORT_INBOX = 'kasia.info.es@gmail.com';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  // Campo señuelo invisible en el formulario: si viene con algo cargado, es
  // un bot rellenando todos los inputs del form, no una persona.
  if (body?.website) {
    return NextResponse.json({ ok: true });
  }

  const phone = String(body?.phone ?? '').trim();
  const email = String(body?.email ?? '').trim();
  const message = String(body?.message ?? '').trim();

  if (!phone || !email) {
    return NextResponse.json({ error: 'Completa tu teléfono y tu email.' }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Ese email no parece válido.' }, { status: 400 });
  }

  const { subject, html } = supportRequestEmailTemplate(phone, email, message);
  const result = await sendEmail({ to: SUPPORT_INBOX, subject, html });
  if (!result.ok) {
    return NextResponse.json({ error: result.error ?? 'No pudimos enviar tu consulta.' }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
