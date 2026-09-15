import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';
import { fetchRoomById } from '@/lib/properties.server';
import { resolveStripeSecretKey } from '@/lib/settings.server';
import { sendEmail } from '@/lib/email.server';
import { paymentConfirmedEmailTemplate, paymentNotificationEmailTemplate } from '@/lib/email-templates';

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

  // El session_id viaja en la URL de la página de éxito, así que hay que tratarlo
  // como público: sin comprobar que la sesión se creó para ESTE usuario, cualquiera
  // con ese id podía marcarse como "pagado" sin haber pagado nada.
  if (
    session.payment_status !== 'paid' ||
    session.metadata?.roomId !== roomId ||
    session.metadata?.userId !== user.id
  ) {
    return NextResponse.json({ error: 'El pago no pudo verificarse.' }, { status: 402 });
  }

  const amount = (session.amount_total ?? 0) / 100;

  const { error } = await supabase.from('bookings').upsert(
    {
      room_id: roomId,
      user_id: user.id,
      user_email: user.email,
      status: 'pagado',
      amount,
      stripe_session_id: sessionId,
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'room_id,user_id' }
  );

  if (error) {
    // 23505 = el índice único de stripe_session_id: esa sesión ya la reclamó
    // otra reserva, así que no se puede volver a canjear.
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Este pago ya fue registrado.' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Los emails de confirmación son best-effort: si Resend falla, la reserva
  // ya quedó guardada igual y no bloqueamos la respuesta por esto.
  try {
    if (user.email) {
      const customer = paymentConfirmedEmailTemplate(room.title, amount);
      await sendEmail({ to: user.email, subject: customer.subject, html: customer.html });
    }

    const adminEmails = (process.env.ADMIN_EMAILS ?? '')
      .split(',')
      .map((e) => e.trim())
      .filter(Boolean);
    if (adminEmails.length > 0) {
      const internal = paymentNotificationEmailTemplate(room.title, user.email ?? '—', amount);
      await sendEmail({ to: adminEmails, subject: internal.subject, html: internal.html });
    }
  } catch {
    // best-effort, ver comentario arriba
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
