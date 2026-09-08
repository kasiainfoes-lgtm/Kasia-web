'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AdminVisitAction({
  bookingId,
  visitStatus,
}: {
  bookingId: string;
  visitStatus: 'pendiente' | 'agendada' | 'hecha';
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (visitStatus !== 'agendada') {
    return <span className="text-xs text-vivi-muted">—</span>;
  }

  return (
    <button
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        await fetch('/api/admin/visit-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId, visitStatus: 'hecha' }),
        });
        setLoading(false);
        router.refresh();
      }}
      className="rounded-full border border-slate-300 px-2.5 py-1 text-xs font-semibold text-vivi-ink hover:border-vivi-navy disabled:opacity-50"
    >
      {loading ? '…' : 'Marcar hecha'}
    </button>
  );
}
