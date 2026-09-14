'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDocumentsActions({ id }: { id: string }) {
  const router = useRouter();
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function act(action: 'approve-documents' | 'reject-documents') {
    setLoading(action === 'approve-documents' ? 'approve' : 'reject');
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/applications/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action === 'reject-documents' ? { action, note } : { action }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'No pudimos completar la acción.');
      setMessage(
        action === 'approve-documents' || data.emailSent
          ? 'Listo.'
          : `Guardado, pero no pudimos enviar el email${data.emailError ? `: ${data.emailError}` : '.'}`
      );
      setRejecting(false);
      setNote('');
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'No pudimos completar la acción.');
    } finally {
      setLoading(null);
    }
  }

  if (rejecting) {
    return (
      <div className="flex flex-col items-start gap-1.5">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="¿Qué tiene que corregir?"
          rows={2}
          className="w-48 rounded-lg border border-slate-300 px-2 py-1.5 text-xs"
        />
        <div className="flex gap-2">
          <button
            type="button"
            disabled={loading !== null || !note.trim()}
            onClick={() => act('reject-documents')}
            className="rounded-full bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:brightness-95 disabled:opacity-50"
          >
            {loading === 'reject' ? 'Enviando…' : 'Confirmar rechazo'}
          </button>
          <button
            type="button"
            disabled={loading !== null}
            onClick={() => {
              setRejecting(false);
              setNote('');
            }}
            className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-vivi-ink hover:border-vivi-navy disabled:opacity-50"
          >
            Cancelar
          </button>
        </div>
        {message && <p className="max-w-[220px] text-xs text-vivi-muted">{message}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1.5">
      <div className="flex gap-2">
        <button
          type="button"
          disabled={loading !== null}
          onClick={() => act('approve-documents')}
          className="rounded-full bg-vivi-mint px-3 py-1.5 text-xs font-bold text-vivi-navy hover:brightness-95 disabled:opacity-50"
        >
          {loading === 'approve' ? 'Aprobando…' : 'Aprobar documentos'}
        </button>
        <button
          type="button"
          disabled={loading !== null}
          onClick={() => setRejecting(true)}
          className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-vivi-ink hover:border-vivi-navy disabled:opacity-50"
        >
          Rechazar
        </button>
      </div>
      {message && <p className="max-w-[220px] text-xs text-vivi-muted">{message}</p>}
    </div>
  );
}
