import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  const supabase = createClient();
  if (!supabase) return NextResponse.json({ error: 'Supabase no está configurado.' }, { status: 501 });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { roomId } = await request.json().catch(() => ({ roomId: null }));
  if (!roomId) return NextResponse.json({ error: 'Falta la habitación.' }, { status: 400 });

  // Se borra con el cliente admin (no el de RLS) porque el borrado es una
  // operación excepcional pensada para "arrepentirme antes de pagar", no
  // parte del flujo normal de reserva — igual que del lado del panel interno.
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: 'Supabase no está configurado.' }, { status: 501 });

  const { data: booking } = await admin
    .from('bookings')
    .select('status')
    .eq('room_id', roomId)
    .eq('user_id', user.id)
    .maybeSingle();
  if (!booking) return NextResponse.json({ ok: true });

  if (booking.status === 'pagado') {
    return NextResponse.json(
      { error: 'Esta reserva ya está pagada. Contactá con tu asesor/a para gestionar la cancelación.' },
      { status: 400 }
    );
  }

  const { error } = await admin.from('bookings').delete().eq('room_id', roomId).eq('user_id', user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
