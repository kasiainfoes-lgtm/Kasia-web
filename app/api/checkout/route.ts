import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { calculateBookingTotal } from '@/lib/rooms';
import { fetchRoomById } from '@/lib/properties.server';
import { resolveStripeSecretKey } from '@/lib/settings.server';
import { resolveSiteUrl } from '@/lib/site-url';
import { getApprovedUser } from '@/lib/require-approved.server';
import { createAdminClient } from '@/lib/supabase/admin';
import { findAuthUserByEmail } from '@/lib/supabase/find-user.server';
import { PLATFORM_FEE_CENTS } from '@/lib/stripe-connect.server';

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
  const depositCents = Math.round(deposit * 100);
  const origin = resolveSiteUrl(request);

  // Si la habitación es de un propietario externo con su cuenta bancaria ya
  // conectada (Stripe Connect), el pago se divide solo: el resto le llega
  // directo a su cuenta, y a Kasia le queda la comisión fija como
  // application_fee_amount. Si no tiene cuenta conectada (p. ej. es una
  // propiedad que gestiona Kasia misma), el pago entero queda en la cuenta
  // de Kasia, como siempre.
  let paymentIntentData: Stripe.Checkout.SessionCreateParams.PaymentIntentData | undefined;
  const admin = createAdminClient();
  if (admin && room.managerEmail) {
    const ownerAuthUser = await findAuthUserByEmail(admin, room.managerEmail);
    if (ownerAuthUser) {
      const { data: ownerProfile } = await admin
        .from('profiles')
        .select('role, stripe_connect_account_id, stripe_connect_onboarded')
        .eq('id', ownerAuthUser.id)
        .maybeSingle();
      if (ownerProfile?.role === 'owner' && ownerProfile.stripe_connect_onboarded && ownerProfile.stripe_connect_account_id) {
        paymentIntentData = {
          application_fee_amount: Math.min(PLATFORM_FEE_CENTS, depositCents),
          transfer_data: { destination: ownerProfile.stripe_connect_account_id },
        };
      }
    }
  }

  const stripe = new Stripe(secretKey);
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'eur',
          unit_amount: depositCents,
          product_data: { name: `Fianza · ${room.title}` },
        },
        quantity: 1,
      },
    ],
    payment_intent_data: paymentIntentData,
    // userId queda grabado en la sesión de Stripe para que /api/bookings/confirm-payment
    // pueda comprobar que quien la reclama es quien la pagó.
    metadata: { roomId, userId: access.userId },
    success_url: `${origin}/reservar/${roomId}/exito?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/reservar/${roomId}`,
  });

  return NextResponse.json({ url: session.url });
}
