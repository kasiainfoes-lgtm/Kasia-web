'use client';

import { useMemo, useState } from 'react';
import AdminVisitAction from '@/components/AdminVisitAction';

export type CalendarVisit = {
  bookingId: string;
  roomTitle: string;
  manager: string;
  userEmail: string | null;
  visitAt: string;
  visitStatus: 'agendada' | 'hecha';
};

const WEEKDAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const MONTH_LABELS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

// Lunes = 0 ... domingo = 6, para que la grilla arranque como en un
// calendario en español (getDay() de JS arranca en domingo = 0).
function mondayFirst(jsDay: number): number {
  return (jsDay + 6) % 7;
}

export default function AdminVisitCalendar({ visits }: { visits: CalendarVisit[] }) {
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const visitsByDay = useMemo(() => {
    const map = new Map<string, CalendarVisit[]>();
    for (const visit of visits) {
      const key = dayKey(new Date(visit.visitAt));
      map.set(key, [...(map.get(key) ?? []), visit]);
    }
    for (const list of map.values()) list.sort((a, b) => a.visitAt.localeCompare(b.visitAt));
    return map;
  }, [visits]);

  const cells = useMemo(() => {
    const firstOfMonth = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const startOffset = mondayFirst(firstOfMonth.getDay());
    const gridStart = new Date(firstOfMonth);
    gridStart.setDate(gridStart.getDate() - startOffset);

    return Array.from({ length: 42 }, (_, i) => {
      const date = new Date(gridStart);
      date.setDate(date.getDate() + i);
      return date;
    });
  }, [cursor]);

  const upcoming = useMemo(
    () =>
      visits
        .filter((v) => v.visitStatus === 'agendada' && new Date(v.visitAt) >= new Date(new Date().toDateString()))
        .sort((a, b) => a.visitAt.localeCompare(b.visitAt)),
    [visits]
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
            className="rounded-full border border-slate-300 px-3 py-1.5 text-sm font-semibold text-vivi-ink hover:border-vivi-navy"
          >
            ←
          </button>
          <p className="text-sm font-extrabold text-vivi-ink">
            {MONTH_LABELS[cursor.getMonth()]} {cursor.getFullYear()}
          </p>
          <button
            type="button"
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
            className="rounded-full border border-slate-300 px-3 py-1.5 text-sm font-semibold text-vivi-ink hover:border-vivi-navy"
          >
            →
          </button>
        </div>

        <div className="mt-4 grid grid-cols-7 gap-1.5 text-center text-xs font-bold uppercase text-vivi-muted">
          {WEEKDAY_LABELS.map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        <div className="mt-1.5 grid grid-cols-7 gap-1.5">
          {cells.map((date) => {
            const inMonth = date.getMonth() === cursor.getMonth();
            const isToday = dayKey(date) === dayKey(today);
            const dayVisits = visitsByDay.get(dayKey(date)) ?? [];
            return (
              <div
                key={date.toISOString()}
                className={`min-h-[92px] rounded-lg border p-1.5 text-left ${
                  inMonth ? 'border-slate-200 bg-white' : 'border-slate-100 bg-slate-50'
                }`}
              >
                <p
                  className={`text-xs font-semibold ${
                    isToday
                      ? 'inline-flex h-5 w-5 items-center justify-center rounded-full bg-vivi-navy text-white'
                      : inMonth
                        ? 'text-vivi-ink'
                        : 'text-vivi-muted'
                  }`}
                >
                  {date.getDate()}
                </p>
                <div className="mt-1 space-y-1">
                  {dayVisits.slice(0, 3).map((v) => (
                    <p
                      key={v.bookingId}
                      title={`${v.roomTitle} · ${v.manager} · ${v.userEmail ?? ''}`}
                      className={`truncate rounded px-1 py-0.5 text-[10px] font-semibold ${
                        v.visitStatus === 'hecha'
                          ? 'bg-vivi-mintLight text-red-700'
                          : 'bg-indigo-50 text-indigo-600'
                      }`}
                    >
                      {new Date(v.visitAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}{' '}
                      {v.roomTitle}
                    </p>
                  ))}
                  {dayVisits.length > 3 && (
                    <p className="text-[10px] font-semibold text-vivi-muted">+{dayVisits.length - 3} más</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-sm font-extrabold text-vivi-ink">Próximas visitas ({upcoming.length})</p>
        <div className="mt-4 space-y-4">
          {upcoming.length === 0 && <p className="text-sm text-vivi-muted">No hay visitas agendadas.</p>}
          {upcoming.map((v) => (
            <div key={v.bookingId} className="border-b border-slate-100 pb-4 last:border-0">
              <p className="text-sm font-semibold text-vivi-ink">
                {new Date(v.visitAt).toLocaleString('es-ES', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              <p className="mt-0.5 text-xs text-vivi-muted">{v.roomTitle} · {v.manager}</p>
              <p className="text-xs text-vivi-muted">{v.userEmail ?? '—'}</p>
              <div className="mt-2">
                <AdminVisitAction bookingId={v.bookingId} visitStatus={v.visitStatus} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
