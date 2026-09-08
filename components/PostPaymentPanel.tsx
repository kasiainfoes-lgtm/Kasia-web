'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Room } from '@/lib/rooms';

export default function PostPaymentPanel({ room }: { room: Room }) {
  return (
    <Suspense>
      <PostPaymentPanelInner room={room} />
    </Suspense>
  );
}

function PostPaymentPanelInner({ room }: { room: Room }) {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [saved, setSaved] = useState<'saving' | 'saved' | 'skipped'>('saving');
  const [visitAt, setVisitAt] = useState('');
  const [scheduling, setScheduling] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [scheduled, setScheduled] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      setSaved('skipped');
      return;
    }
    fetch('/api/bookings/confirm-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, roomId: room.id }),
    })
      .then((res) => setSaved(res.ok ? 'saved' : 'skipped'))
      .catch(() => setSaved('skipped'));
  }, [sessionId, room.id]);

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

  return (
    <div className="mt-8 grid gap-6 text-left sm:grid-cols-2">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <p className="text-sm font-bold text-vivi-ink">Contactá a tu asesora</p>
        <div className="mt-3 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-vivi-mintLight font-bold text-emerald-700">
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
        {saved === 'skipped' && (
          <p className="mt-3 text-xs text-vivi-muted">
            (Modo demo: esta reserva no quedó guardada en el panel interno porque Supabase/Stripe
            todavía no están conectados.)
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <p className="text-sm font-bold text-vivi-ink">Agendá tu visita</p>
        {scheduled ? (
          <p className="mt-3 text-sm text-emerald-700">
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
    </div>
  );
}
