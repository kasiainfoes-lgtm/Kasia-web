'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Room } from '@/lib/rooms';

type Props = { room: Room; alreadyPaid: boolean; deposit: number; total: number };

export default function PostPaymentPanel(props: Props) {
  return (
    <Suspense>
      <PostPaymentPanelInner {...props} />
    </Suspense>
  );
}

// 'demo' = el servidor respondió 501 (Stripe/Supabase todavía sin configurar).
// 'failed' = el pago no se pudo verificar de verdad; nunca hay que mostrar
// "Pago recibido" en ese caso.
type ConfirmState = 'checking' | 'ok' | 'demo' | 'failed';

function PostPaymentPanelInner({ room, alreadyPaid, deposit, total }: Props) {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [confirm, setConfirm] = useState<ConfirmState>(
    alreadyPaid ? 'ok' : sessionId ? 'checking' : 'failed'
  );
  const [visitAt, setVisitAt] = useState('');
  const [scheduling, setScheduling] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [scheduled, setScheduled] = useState(false);

  useEffect(() => {
    if (alreadyPaid || !sessionId) return;
    fetch('/api/bookings/confirm-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, roomId: room.id }),
    })
      .then((res) => setConfirm(res.ok ? 'ok' : res.status === 501 ? 'demo' : 'failed'))
      .catch(() => setConfirm('failed'));
  }, [sessionId, room.id, alreadyPaid]);

  async function handleSchedule(e: React.FormEvent) {
    e.preventDefault();
    setScheduling(true);
    setScheduleError(null);
    const res = await fetch('/api/bookings/schedule-visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId: room.id, visitAt }),
    });
    setScheduling(false);
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'No se pudo agendar la visita.' }));
      setScheduleError(error);
      return;
    }
    setScheduled(true);
  }

  const confirmed = confirm === 'ok' || confirm === 'demo';

  return (
    <>
      {confirm === 'checking' && (
        <>
          <span className="inline-block rounded-full bg-slate-100 px-4 py-1.5 text-xs font-bold text-vivi-muted">
            Verificando
          </span>
          <h1 className="mt-4 text-2xl font-extrabold text-vivi-ink">Comprobando tu pago…</h1>
          <p className="mt-3 text-sm text-vivi-muted">Esto tarda solo unos segundos.</p>
        </>
      )}

      {confirm === 'failed' && (
        <>
          <span className="inline-block rounded-full bg-amber-100 px-4 py-1.5 text-xs font-bold text-amber-800">
            Sin confirmar
          </span>
          <h1 className="mt-4 text-2xl font-extrabold text-vivi-ink">No pudimos confirmar el pago</h1>
          <p className="mt-3 text-sm text-vivi-muted">
            Si el importe se descontó de tu cuenta, no vuelvas a pagar: escríbele a tu asesora con
            esta pantalla y lo revisamos enseguida.
          </p>
        </>
      )}

      {confirmed && (
        <>
          <span className="inline-block rounded-full bg-vivi-mintLight px-4 py-1.5 text-xs font-bold text-red-700">
            Reserva confirmada
          </span>
          <h1 className="mt-4 text-2xl font-extrabold text-vivi-ink">Pago recibido</h1>
          <p className="mt-3 text-sm text-vivi-muted">
            Has reservado <strong>{room.title}</strong>. Coordina tu visita y habla con tu asesora
            cuando quieras.
          </p>

          <dl className="mx-auto mt-6 max-w-sm space-y-2 rounded-2xl border border-slate-200 bg-white p-5 text-left text-sm">
            <div className="flex justify-between">
              <dt className="text-vivi-muted">Fianza (1 mensualidad)</dt>
              <dd className="font-bold text-vivi-ink">{deposit.toFixed(2)} €</dd>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2 text-base">
              <dt className="font-bold text-vivi-ink">TOTAL PAGADO</dt>
              <dd className="font-extrabold text-vivi-ink">{total.toFixed(2)} €</dd>
            </div>
          </dl>
        </>
      )}

      <div className="mt-8 grid gap-6 text-left sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-sm font-bold text-vivi-ink">Contacta a tu asesora</p>
          <div className="mt-3 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-vivi-mintLight font-bold text-red-700">
              {room.manager.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-semibold text-vivi-ink">{room.manager}</p>
              <p className="text-xs text-vivi-muted">{room.responseTime}</p>
            </div>
          </div>
          <div className="mt-4 space-y-2 text-sm">
            <a href={`tel:${room.managerPhone}`} className="block font-medium text-vivi-navy hover:underline">
              📞 {room.managerPhone}
            </a>
            <a
              href={`mailto:${room.managerEmail}`}
              className="block font-medium text-vivi-navy hover:underline"
            >
              ✉️ {room.managerEmail}
            </a>
          </div>
          {confirm === 'demo' && (
            <p className="mt-3 text-xs text-vivi-muted">
              (Modo demo: esta reserva no quedó guardada en el panel interno porque Supabase/Stripe
              todavía no están conectados.)
            </p>
          )}
        </div>

        {confirmed && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-sm font-bold text-vivi-ink">Agenda tu visita</p>
            {scheduled ? (
              <p className="mt-3 text-sm text-red-700">
                ✓ Visita agendada para {new Date(visitAt).toLocaleString('es-ES')}
              </p>
            ) : (
              <form onSubmit={handleSchedule} className="mt-3 space-y-3">
                <input
                  type="datetime-local"
                  required
                  value={visitAt}
                  onChange={(e) => setVisitAt(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
                <button
                  type="submit"
                  disabled={scheduling}
                  className="w-full rounded-lg bg-vivi-navy px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {scheduling ? 'Agendando…' : 'Confirmar visita'}
                </button>
                {scheduleError && <p className="text-xs text-red-600">{scheduleError}</p>}
              </form>
            )}
          </div>
        )}
      </div>
    </>
  );
}
