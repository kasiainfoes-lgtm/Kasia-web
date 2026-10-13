'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function PublishToggle({ id, published }: { id: string; published: boolean }) {
  const router = useRouter();
  const [current, setCurrent] = useState(published);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    const next = !current;
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/admin/properties/${id}/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: next }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'No pudimos actualizar el estado.');
      return;
    }
    setCurrent(next);
    router.refresh();
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        role="switch"
        aria-checked={current}
        disabled={loading}
        onClick={toggle}
        className={`flex items-center gap-2 text-xs font-semibold disabled:opacity-60 ${
          current ? 'text-red-700' : 'text-vivi-muted'
        }`}
      >
        <span
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
            current ? 'bg-vivi-mint' : 'bg-slate-300'
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
              current ? 'translate-x-5' : 'translate-x-0.5'
            }`}
          />
        </span>
        {current ? 'Publicada' : 'Oculta'}
      </button>
      {error && <p className="max-w-[160px] text-xs text-red-600">{error}</p>}
    </div>
  );
}
