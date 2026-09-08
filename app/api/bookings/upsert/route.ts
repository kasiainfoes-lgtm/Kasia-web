import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const ALLOWED_CLIENT_STATUSES = ['nuevo', 'verificado'];

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

  const { roomId, status } = await request.json();
  if (!ALLOWED_CLIENT_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Estado inválido' }, { status: 400 });
  }

  const { error } = await supabase.from('bookings').upsert(
    {
      room_id: roomId,
      user_id: user.id,
      user_email: user.email,
      status,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'room_id,user_id' }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
