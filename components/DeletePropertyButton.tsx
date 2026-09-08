'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DeletePropertyButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <button
      disabled={loading}
      onClick={async () => {
        if (!confirm(`¿Eliminar "${title}"? Esta acción no se puede deshacer.`)) return;
        setLoading(true);
        await fetch(`/api/admin/properties/${id}`, { method: 'DELETE' });
        setLoading(false);
        router.refresh();
      }}
      className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:border-red-400 disabled:opacity-50"
    >
      {loading ? '…' : 'Eliminar'}
    </button>
  );
}
