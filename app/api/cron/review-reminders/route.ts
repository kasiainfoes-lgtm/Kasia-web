import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { fetchRoomById } from '@/lib/properties.server';
import { sendEmail } from '@/lib/email.server';
import { reviewRequestEmailTemplate } from '@/lib/email-templates';
import { resolveSiteUrl } from '@/lib/site-url';

const REVIEW_DELAY_DAYS = 60;

// Disparado una vez al día por .github/workflows/review-reminders.yml (no
// hay nada en el VPS que corra cron jobs, así que GitHub Actions hace de
// reloj). Protegido con CRON_SECRET para que nadie más pueda spammear estos
// emails llamando al endpoint directamente.
export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get('authorization');
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: 'Supabase no está configurado.' }, { status: 501 });

  const cutoff = new Date(Date.now() - REVIEW_DELAY_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const { data: bookings, error } = await admin
    .from('bookings')
    .select('id, room_id, user_email')
    .eq('status', 'pagado')
    .is('review_reminder_sent_at', null)
    .not('paid_at', 'is', null)
    .lte('paid_at', cutoff);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const siteUrl = resolveSiteUrl(request);
  let sent = 0;

  for (const booking of bookings ?? []) {
    if (!booking.user_email) continue;
    const room = await fetchRoomById(booking.room_id);
    if (!room) continue;

    const { subject, html } = reviewRequestEmailTemplate(room.title, `${siteUrl}/rooms/${room.id}`);
    const result = await sendEmail({ to: booking.user_email, subject, html });
    // Si Resend falla, dejamos review_reminder_sent_at sin marcar para
    // reintentar mañana en vez de perder el recordatorio para siempre.
    if (result.ok) {
      await admin
        .from('bookings')
        .update({ review_reminder_sent_at: new Date().toISOString() })
        .eq('id', booking.id);
      sent++;
    }
  }

  return NextResponse.json({ ok: true, checked: bookings?.length ?? 0, sent });
}
