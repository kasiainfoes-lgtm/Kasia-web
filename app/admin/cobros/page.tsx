import { ownerPageGate } from '@/lib/require-owner.server';
import { getSessionUser, getOwnProfile } from '@/lib/supabase/session.server';
import { getStripeClient, refreshConnectStatus, PLATFORM_FEE_CENTS } from '@/lib/stripe-connect.server';
import AdminGateMessage from '@/components/AdminGateMessage';
import AdminTabs from '@/components/AdminTabs';
import ConnectOnboardButton from '@/components/ConnectOnboardButton';

export const dynamic = 'force-dynamic';

export default async function CobrosPage() {
  const gate = await ownerPageGate('/admin/cobros');
  if (!gate.ok) return <AdminGateMessage reason={gate.reason} />;

  if (gate.isAdmin) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-12">
        <p className="text-xs font-bold uppercase tracking-wide text-vivi-mint">Panel interno</p>
        <h1 className="mt-2 text-2xl font-extrabold text-vivi-ink sm:text-3xl">Cobros</h1>
        <AdminTabs role="admin" active="/admin/cobros" />
        <p className="text-sm text-vivi-muted">
          Esta sección es para que los propietarios conecten su cuenta bancaria — tú ya cobras
          directo en tu cuenta de Stripe, no hace falta nada aquí.
        </p>
      </section>
    );
  }

  const user = await getSessionUser();
  const profile = user ? await getOwnProfile(user.id) : null;

  let onboarded = profile?.stripeConnectOnboarded ?? false;
  const accountId = profile?.stripeConnectAccountId ?? null;

  // Si ya tiene cuenta pero todavía no la marcamos como "lista", volvemos a
  // preguntarle a Stripe — puede que recién haya terminado de cargar sus
  // datos allá y haya vuelto acá.
  if (accountId && !onboarded) {
    const stripe = await getStripeClient();
    if (stripe) {
      const status = await refreshConnectStatus(stripe, user!.id, accountId);
      onboarded = status.payoutsEnabled;
    }
  }

  return (
    <section className="mx-auto max-w-3xl px-6 py-12">
      <p className="text-xs font-bold uppercase tracking-wide text-vivi-mint">Panel interno</p>
      <h1 className="mt-2 text-2xl font-extrabold text-vivi-ink sm:text-3xl">Cobros</h1>
      <AdminTabs role="owner" active="/admin/cobros" />

      <div className="rounded-2xl border border-stone-200 bg-vivi-card p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-vivi-ink">Tu cuenta bancaria</p>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-bold ${
              onboarded ? 'bg-vivi-mintLight text-vivi-mint' : 'bg-stone-100 text-vivi-muted'
            }`}
          >
            {onboarded ? 'Conectada' : 'Sin conectar'}
          </span>
        </div>

        {onboarded ? (
          <>
            <p className="mt-3 text-sm text-vivi-muted">
              Tu cuenta ya está lista para recibir pagos. Cuando alguien reserve una de tus
              habitaciones, la fianza llega directo a tu cuenta (menos {(PLATFORM_FEE_CENTS / 100).toFixed(0)} € de
              comisión para Kasia).
            </p>
            <div className="mt-4">
              <ConnectOnboardButton label="Actualizar mis datos en Stripe" />
            </div>
          </>
        ) : (
          <>
            <p className="mt-3 text-sm text-vivi-muted">
              Conecta tu cuenta bancaria (vas a ir a Stripe, que es quien procesa el pago — nunca
              nos pasas tu IBAN a nosotros directamente) para poder empezar a recibir pagos. Es
              gratis y toma unos minutos.
            </p>
            <div className="mt-4">
              <ConnectOnboardButton label="Conectar mi cuenta bancaria" />
            </div>
          </>
        )}
      </div>
    </section>
  );
}
