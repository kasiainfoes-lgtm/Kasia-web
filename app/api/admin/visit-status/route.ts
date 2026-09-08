import { NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/require-admin.server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: 'Supabase no está configurado.' }, { status: 501 });

  const { bookingId, visitStatus } = await request.json();
  if (!['pendiente', 'agendada', 'hecha'].includes(visitStatus)) {
    return NextResponse.json({ error: 'Estado inválido' }, { status: 400 });
  }

  const { error } = await admin
    .from('bookings')
    .update({ visit_status: visitStatus, updated_at: new Date().toISOString() })
    .eq('id', bookingId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
