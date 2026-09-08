import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

  return NextResponse.json({ ok: true });
}
