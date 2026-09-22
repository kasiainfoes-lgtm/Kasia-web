import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { fetchRoomById } from '@/lib/properties.server';
import { sendEmail } from '@/lib/email.server';
import { visitScheduledEmailTemplate, visitScheduledAdminNotificationEmailTemplate } from '@/lib/email-templates';
import { formatDateTimeEs } from '@/lib/format';

export async function POST(request: Request) {
  const supabase = createClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase no está configurado.' }, { status: 501 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const { roomId, visitAt } = await request.json();
  if (!visitAt) {
    return NextResponse.json({ error: 'Falta la fecha de la visita' }, { status: 400 });
  }

  // Se puede llamar de nuevo para reprogramar (visit_status ya en 'agendada'),
  // así que no se restringe a un estado anterior puntual.
  const { data, error } = await supabase
    .from('bookings')
    .update({ visit_status: 'agendada', visit_at: visitAt, updated_at: new Date().toISOString() })
    .eq('room_id', roomId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: 'No encontramos tu reserva pagada para esta habitación.' },
      { status: 404 }
    );
  }

  // Best-effort: la visita ya quedó agendada aunque falle el envío de emails.
  try {
    const room = await fetchRoomById(roomId);
    const visitAtLabel = formatDateTimeEs(visitAt);
    if (room && user.email) {
      const { subject, html } = visitScheduledEmailTemplate(room.title, visitAtLabel);
      await sendEmail({ to: user.email, subject, html });
    }
    const adminEmails = (process.env.ADMIN_EMAILS ?? '')
      .split(',')
      .map((e) => e.trim())
      .filter(Boolean);
    if (adminEmails.length > 0 && room) {
      const { subject, html } = visitScheduledAdminNotificationEmailTemplate(
        room.title,
        user.email ?? data.user_email ?? '—',
        visitAtLabel
      );
      await sendEmail({ to: adminEmails, subject, html });
    }
  } catch {
    // best-effort, ver comentario arriba
  }

  return NextResponse.json({ ok: true });
}
