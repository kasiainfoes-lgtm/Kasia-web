import { NextResponse } from 'next/server';
import { getOwnerUser } from '@/lib/require-owner.server';
import { getOwnProfile } from '@/lib/supabase/session.server';
import { getStripeClient, ensureConnectAccount } from '@/lib/stripe-connect.server';
import { resolveSiteUrl } from '@/lib/site-url';

export async function POST(request: Request) {
  const access = await getOwnerUser();
  if (!access || access.isAdmin) {
    // Kasia no es una propietaria conectada — esto es solo para dueños reales.
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const stripe = await getStripeClient();
  if (!stripe) {
    return NextResponse.json(
      { error: 'Stripe no está configurado todavía. Pídele al equipo de Kasia que lo revise.' },
      { status: 501 }
    );
  }

  const profile = await getOwnProfile(access.userId);
  const accountId = await ensureConnectAccount(
    stripe,
    access.userId,
    access.email,
    profile?.stripeConnectAccountId ?? null
  );

  const origin = resolveSiteUrl(request);
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${origin}/admin/cobros`,
    return_url: `${origin}/admin/cobros`,
    type: 'account_onboarding',
  });

  return NextResponse.json({ url: accountLink.url });
}
