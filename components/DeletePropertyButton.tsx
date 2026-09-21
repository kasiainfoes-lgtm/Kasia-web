'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DeletePropertyButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        disabled={loading}
        onClick={async () => {
          if (!confirm(`¿Eliminar "${title}"? Esta acción no se puede deshacer.`)) return;
          setLoading(true);
          setError(null);
          const res = await fetch(`/api/admin/properties/${id}`, { method: 'DELETE' });
          setLoading(false);
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            setError(data.error || 'No pudimos eliminar la habitación.');
            return;
          }
          router.refresh();
        }}
        className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:border-red-400 disabled:opacity-50"
      >
        {loading ? '…' : 'Eliminar'}
      </button>
      {error && <p className="max-w-[220px] text-xs text-red-600">{error}</p>}
    </div>
  );
}
