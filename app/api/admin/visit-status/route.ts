import { NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/require-admin.server';
import { createAdminClient } from '@/lib/supabase/admin';
import { fetchRoomById } from '@/lib/properties.server';
import { sendEmail } from '@/lib/email.server';
import { reviewRequestEmailTemplate } from '@/lib/email-templates';
import { resolveSiteUrl } from '@/lib/site-url';

export async function POST(request: Request) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: 'Supabase no está configurado.' }, { status: 501 });

  const { bookingId, visitStatus } = await request.json();
  if (!['pendiente', 'agendada', 'hecha'].includes(visitStatus)) {
    return NextResponse.json({ error: 'Estado inválido' }, { status: 400 });
  }

  const { data: booking, error } = await admin
    .from('bookings')
    .update({ visit_status: visitStatus, updated_at: new Date().toISOString() })
    .eq('id', bookingId)
    .select('room_id, user_email')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (visitStatus === 'hecha' && booking?.user_email) {
    // Best-effort: la visita ya quedó marcada como hecha aunque falle el email.
    try {
      const room = await fetchRoomById(booking.room_id);
      if (room) {
        const siteUrl = resolveSiteUrl(request);
        const { subject, html } = reviewRequestEmailTemplate(room.title, `${siteUrl}/reservar/${room.id}/exito`);
        await sendEmail({ to: booking.user_email, subject, html });
      }
    } catch {
      // best-effort, ver comentario arriba
    }
  }

  return NextResponse.json({ ok: true });
}
