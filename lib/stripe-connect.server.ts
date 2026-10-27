import Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import { resolveStripeSecretKey } from '@/lib/settings.server';

// 50€ fijos por reserva para Kasia — el resto de la fianza va directo a la
// cuenta bancaria conectada del propietario. Acordado con Kasia: no es un
// porcentaje, es un monto fijo por transacción.
export const PLATFORM_FEE_CENTS = 5000;

export async function getStripeClient(): Promise<Stripe | null> {
  const secretKey = await resolveStripeSecretKey();
  if (!secretKey) return null;
  return new Stripe(secretKey);
}

// Crea (o reutiliza) la cuenta Express de Stripe Connect de este
// propietario y la deja guardada en profiles para no crear una nueva cada
// vez que vuelve a pasar por acá.
export async function ensureConnectAccount(
  stripe: Stripe,
  userId: string,
  email: string,
  existingAccountId: string | null
): Promise<string> {
  if (existingAccountId) return existingAccountId;

  const account = await stripe.accounts.create({
    type: 'express',
    email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  });

  const admin = createAdminClient();
  if (admin) {
    await admin.from('profiles').update({ stripe_connect_account_id: account.id }).eq('id', userId);
  }

  return account.id;
}

// Se llama cada vez que el propietario abre /admin/cobros: Stripe es la
// única fuente de verdad de si ya terminó el alta (subió el IBAN, verificó
// identidad, etc) — acá solo se refleja ese estado en profiles.
export async function refreshConnectStatus(
  stripe: Stripe,
  userId: string,
  accountId: string
): Promise<{ detailsSubmitted: boolean; payoutsEnabled: boolean }> {
  const account = await stripe.accounts.retrieve(accountId);
  const onboarded = !!account.details_submitted && !!account.payouts_enabled;

  const admin = createAdminClient();
  if (admin) {
    await admin.from('profiles').update({ stripe_connect_onboarded: onboarded }).eq('id', userId);
  }

  return { detailsSubmitted: !!account.details_submitted, payoutsEnabled: !!account.payouts_enabled };
}
