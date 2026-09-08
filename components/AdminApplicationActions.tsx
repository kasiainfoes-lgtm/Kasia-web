'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Action = 'approve' | 'request-info';

export default function AdminApplicationActions({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<Action | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function act(action: Action) {
    setLoading(action);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/applications/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'No pudimos completar la acción.');
      setMessage(
        data.emailSent
          ? 'Listo, email enviado.'
          : `Guardado, pero no pudimos enviar el email${data.emailError ? `: ${data.emailError}` : '.'}`
      );
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'No pudimos completar la acción.');
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-col items-start gap-1.5">
      <div className="flex gap-2">
        <button
          type="button"
          disabled={loading !== null}
          onClick={() => act('approve')}
          className="rounded-full bg-vivi-mint px-3 py-1.5 text-xs font-bold text-vivi-navy hover:brightness-95 disabled:opacity-50"
        >
          {loading === 'approve' ? 'Aprobando…' : 'Aprobar'}
        </button>
        <button
          type="button"
          disabled={loading !== null}
          onClick={() => act('request-info')}
          className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-vivi-ink hover:border-vivi-navy disabled:opacity-50"
        >
          {loading === 'request-info' ? 'Enviando…' : 'Pedir más información'}
        </button>
      </div>
      {message && <p className="max-w-[220px] text-xs text-vivi-muted">{message}</p>}
    </div>
  );
}
