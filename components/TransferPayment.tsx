'use client';

import { useState } from 'react';
import BookingTermsContent from '@/components/BookingTermsContent';
import type { Room } from '@/lib/rooms';

// Mismos datos que en el contrato en papel de TATC RENT AND INVESTMENTS SL —
// confirmado con Kasia que es la cuenta real para las reservas online.
const TITULAR = 'TATC RENT AND INVESTMENTS SL';
const IBAN = 'ES06 2100 2916 7102 0020 7891';
const BANCO = 'CaixaBank';

const ALLOWED_MIME: Record<string, true> = {
  'image/png': true,
  'image/jpeg': true,
  'image/webp': true,
  'application/pdf': true,
};
const MAX_SIZE_BYTES = 8 * 1024 * 1024;

export default function TransferPayment({
  room,
  deposit,
  pendingReview,
  rejectionNote,
  onSubmitted,
}: {
  room: Room;
  deposit: number;
  pendingReview: boolean;
  rejectionNote: string | null;
  onSubmitted: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(f: File | null) {
    setError(null);
    if (f && !ALLOWED_MIME[f.type]) {
      setError('Solo se aceptan JPG, PNG, WEBP o PDF.');
      setFile(null);
      return;
    }
    if (f && f.size > MAX_SIZE_BYTES) {
      setError('El archivo debe pesar menos de 8 MB.');
      setFile(null);
      return;
    }
    setFile(f);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setError(null);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('roomId', room.id);
    const res = await fetch('/api/bookings/transfer-proof', { method: 'POST', body: fd });
    setUploading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error ?? 'No pudimos subir el comprobante. Probá de nuevo.');
      return;
    }
    setFile(null);
    onSubmitted();
  }

  if (pendingReview) {
    return (
      <div className="mt-6 rounded-xl bg-indigo-50 p-5 text-indigo-900">
        <p className="font-bold">Comprobante recibido</p>
        <p className="mt-2 text-sm">
          Lo estamos revisando. Te avisamos por email en cuanto confirmemos tu reserva.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-5">
      <div>
        <p className="text-sm font-bold text-vivi-ink">Condiciones que ya aceptaste</p>
        <div className="mt-2 max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-vivi-muted">
          <BookingTermsContent roomTitle={room.title} zone={room.zone} price={room.price} deposit={deposit} />
        </div>
      </div>

      <div className="rounded-xl border border-slate-300 bg-white p-4">
        <p className="text-sm font-bold text-vivi-ink">Transferir la fianza</p>
        <dl className="mt-3 space-y-1.5 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-vivi-muted">Titular</dt>
            <dd className="text-right font-semibold text-vivi-ink">{TITULAR}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-vivi-muted">IBAN</dt>
            <dd className="text-right font-semibold text-vivi-ink">{IBAN}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-vivi-muted">Banco</dt>
            <dd className="text-right font-semibold text-vivi-ink">{BANCO}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-vivi-muted">Concepto</dt>
            <dd className="text-right font-semibold text-vivi-ink">Fianza {room.title}</dd>
          </div>
          <div className="flex justify-between gap-3 border-t border-slate-200 pt-1.5 text-base">
            <dt className="font-bold text-vivi-ink">Importe</dt>
            <dd className="font-extrabold text-vivi-ink">{deposit.toFixed(2)} €</dd>
          </div>
        </dl>
      </div>

      {rejectionNote && (
        <p className="rounded-xl bg-red-50 p-3 text-xs text-red-700">
          Tu comprobante anterior no se pudo confirmar: {rejectionNote} Volvé a subirlo abajo.
        </p>
      )}

      <form onSubmit={handleSubmit} className="rounded-xl border border-dashed border-slate-300 p-4">
        <p className="text-sm font-semibold text-vivi-ink">Subir comprobante de la transferencia</p>
        <p className="mt-1 text-xs text-vivi-muted">
          Recordá hacer una captura de pantalla del comprobante apenas hagas la transferencia, para
          subirla acá.
        </p>
        <input
          type="file"
          required
          accept="image/png,image/jpeg,image/webp,application/pdf"
          onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
          className="mt-3 block w-full text-xs text-vivi-muted file:mr-3 file:rounded-lg file:border-0 file:bg-vivi-navy file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white"
        />
        <button
          type="submit"
          disabled={!file || uploading}
          className="mt-3 rounded-lg bg-vivi-navy px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uploading ? 'Enviando…' : 'Enviar comprobante'}
        </button>
        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      </form>
    </div>
  );
}
