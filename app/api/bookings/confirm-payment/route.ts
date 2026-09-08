import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';
import { fetchRoomById } from '@/lib/properties.server';
import { resolveStripeSecretKey } from '@/lib/settings.server';

export async function POST(request: Request) {
  const secretKey = await resolveStripeSecretKey();
  const supabase = createClient();
  if (!secretKey || !supabase) {
    return NextResponse.json({ error: 'Stripe o Supabase no están configurados.' }, { status: 501 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const { sessionId, roomId } = await request.json();
  const room = await fetchRoomById(roomId);
  if (!room) {
    return NextResponse.json({ error: 'Habitación no encontrada' }, { status: 404 });
  }

  const stripe = new Stripe(secretKey);
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status !== 'paid' || session.metadata?.roomId !== roomId) {
    return NextResponse.json({ error: 'El pago no pudo verificarse.' }, { status: 402 });
  }

  const { error } = await supabase.from('bookings').upsert(
    {
      room_id: roomId,
      user_id: user.id,
      user_email: user.email,
      status: 'pagado',
      amount: (session.amount_total ?? 0) / 100,
      stripe_session_id: sessionId,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'room_id,user_id' }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    advisor: {
      name: room.manager,
      phone: room.managerPhone,
      email: room.managerEmail,
    },
  });
}
