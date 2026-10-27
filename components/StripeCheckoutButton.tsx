'use client';

import { useState } from 'react';
import type { Room } from '@/lib/rooms';

export default function StripeCheckoutButton({ room, deposit }: { room: Room; deposit: number }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePay() {
    setLoading(true);
    setError(null);
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId: room.id }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.url) {
      setError(data.error ?? 'No pudimos iniciar el pago. Prueba de nuevo.');
      setLoading(false);
      return;
    }
    window.location.href = data.url;
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="rounded-xl border border-stone-300 bg-vivi-card p-4">
        <p className="text-sm font-bold text-vivi-ink">Pagar la fianza</p>
        <p className="mt-2 text-sm text-vivi-muted">
          Vas a pagar la fianza de forma segura con tarjeta a través de Stripe. Te lleva unos
          segundos y la reserva queda confirmada apenas se acredite.
        </p>
      </div>
      <button
        type="button"
        onClick={handlePay}
        disabled={loading}
        className="w-full rounded-xl bg-vivi-navy px-5 py-3 text-sm font-semibold text-white transition hover:bg-vivi-navyLight disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? 'Redirigiendo a Stripe…' : `Pagar ${deposit.toFixed(2)} € con tarjeta`}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
