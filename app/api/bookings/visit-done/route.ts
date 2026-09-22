import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { fetchRoomById } from '@/lib/properties.server';
import { sendEmail } from '@/lib/email.server';
import { reviewRequestEmailTemplate } from '@/lib/email-templates';
import { resolveSiteUrl } from '@/lib/site-url';

// El inquilino también puede marcar su propia visita como realizada (no solo
// el equipo desde /admin) — ver AdminVisitAction para la versión del panel
// interno, que hace lo mismo del lado del admin.
export async function POST(request: Request) {
  const supabase = createClient();
  if (!supabase) return NextResponse.json({ error: 'Supabase no está configurado.' }, { status: 501 });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { roomId } = await request.json().catch(() => ({ roomId: null }));
  if (!roomId) return NextResponse.json({ error: 'Falta la habitación.' }, { status: 400 });

  const { data, error } = await supabase
    .from('bookings')
    .update({ visit_status: 'hecha', updated_at: new Date().toISOString() })
    .eq('room_id', roomId)
    .eq('user_id', user.id)
    .eq('visit_status', 'agendada')
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'No encontramos una visita agendada para esta habitación.' }, { status: 404 });
  }

  try {
    const room = await fetchRoomById(roomId);
    if (room && user.email) {
      const siteUrl = resolveSiteUrl(request);
      const { subject, html } = reviewRequestEmailTemplate(room.title, `${siteUrl}/reservar/${room.id}/exito`);
      await sendEmail({ to: user.email, subject, html });
    }
  } catch {
    // best-effort: la visita ya quedó marcada como hecha aunque falle el email
  }

  return NextResponse.json({ ok: true });
}
