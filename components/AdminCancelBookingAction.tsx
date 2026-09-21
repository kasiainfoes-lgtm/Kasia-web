'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AdminCancelBookingAction({
  bookingId,
  status,
}: {
  bookingId: string;
  status: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (status === 'pagado') {
    return <span className="text-xs text-vivi-muted">Pagada</span>;
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        disabled={loading}
        onClick={async () => {
          if (!confirm('¿Cancelar esta reserva en proceso? Esta acción no se puede deshacer.')) return;
          setLoading(true);
          setError(null);
          const res = await fetch(`/api/admin/bookings/${bookingId}`, { method: 'DELETE' });
          setLoading(false);
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            setError(data.error || 'No pudimos cancelar la reserva.');
            return;
          }
          router.refresh();
        }}
        className="rounded-full border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-600 hover:border-red-400 disabled:opacity-50"
      >
        {loading ? '…' : 'Cancelar'}
      </button>
      {error && <p className="max-w-[180px] text-xs text-red-600">{error}</p>}
    </div>
  );
}
