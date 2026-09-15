import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { calculateBookingTotal } from '@/lib/rooms';
import { fetchRoomById } from '@/lib/properties.server';
import { resolveStripeSecretKey } from '@/lib/settings.server';
import { resolveSiteUrl } from '@/lib/site-url';
import { getApprovedUser } from '@/lib/require-approved.server';

export async function POST(request: Request) {
  const access = await getApprovedUser();
  if (!access) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const secretKey = await resolveStripeSecretKey();
  if (!secretKey) {
    return NextResponse.json(
      { error: 'Stripe no está configurado todavía. Carga tu clave en /admin/integraciones.' },
      { status: 501 }
    );
  }

  const { roomId } = await request.json();
  const room = await fetchRoomById(roomId);
  if (!room) {
    return NextResponse.json({ error: 'Habitación no encontrada' }, { status: 404 });
  }

  const { deposit } = calculateBookingTotal(room.price);
  const origin = resolveSiteUrl(request);

  const stripe = new Stripe(secretKey);
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'eur',
          unit_amount: Math.round(deposit * 100),
          product_data: { name: `Fianza · ${room.title}` },
        },
        quantity: 1,
      },
    ],
    // userId queda grabado en la sesión de Stripe para que /api/bookings/confirm-payment
    // pueda comprobar que quien la reclama es quien la pagó.
    metadata: { roomId, userId: access.userId },
    success_url: `${origin}/reservar/${roomId}/exito?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/reservar/${roomId}`,
  });

  return NextResponse.json({ url: session.url });
}
