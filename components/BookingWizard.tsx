'use client';

import { useEffect, useState } from 'react';
import type { Room } from '@/lib/rooms';
import { calculateBookingTotal } from '@/lib/rooms';
import { createClient } from '@/lib/supabase/client';
import type { BookingStatus } from '@/lib/bookings.server';

const steps = ['Comprobación de identidad', 'Aceptar condiciones', 'Pagar'];

export default function BookingWizard({
  room,
  initialBookingStatus,
}: {
  room: Room;
  initialBookingStatus: BookingStatus | null;
}) {
  const supabase = createClient();
  const alreadyVerified = initialBookingStatus === 'verificado' || initialBookingStatus === 'pagado';
  const [step, setStep] = useState(initialBookingStatus === 'pagado' ? steps.length - 1 : alreadyVerified ? 1 : 0);
  const [confirmed, setConfirmed] = useState(initialBookingStatus === 'pagado');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [kycVerified, setKycVerified] = useState(alreadyVerified);
  const [kycNote, setKycNote] = useState<string | null>(null);
  const [payError, setPayError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const { deposit, total } = calculateBookingTotal(room.price);

  useEffect(() => {
    supabase?.auth.getUser().then(({ data }) => setUserEmail(data.user?.email ?? null));
  }, [supabase]);

  // Solo registra la etapa 'nuevo' si todavía no existe ninguna reserva para
  // esta persona y habitación — si ya había una más avanzada (verificado,
  // pagado) del lado del servidor, esto la pisaba de vuelta a 'nuevo' cada
  // vez que la página se recargaba (por ejemplo, al volver de Didit).
  useEffect(() => {
    if (!userEmail || initialBookingStatus) return;
    upsertStage('nuevo');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userEmail, initialBookingStatus]);

  const isLastStep = step === steps.length - 1;
  const kycRequired = step === 0 && !kycVerified;

  function upsertStage(status: 'nuevo' | 'verificado') {
    fetch('/api/bookings/upsert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId: room.id, status }),
    }).catch(() => {
      // El seguimiento en el panel interno es best-effort: si Supabase no está
      // configurado todavía, la reserva sigue funcionando igual.
    });
  }

  async function handleVerifyKyc() {
    setKycNote(null);
    const res = await fetch('/api/kyc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId: room.id }),
    });
    if (res.ok) {
      const { url } = await res.json();
      if (url) {
        upsertStage('verificado');
        window.location.href = url;
        return;
      }
    }
    // 501 es el único caso en que el servidor dice "Didit no está configurado".
    // Cualquier otro error es real: dar por verificada la identidad ahí sería
    // saltarse el KYC por una caída de red.
    if (res.status !== 501) {
      setKycNote('No pudimos iniciar la verificación. Vuelve a intentarlo en unos minutos.');
      return;
    }
    setKycNote('Modo demo: Didit todavía no está conectado (ver SETUP.md). Verificación simulada.');
    setKycVerified(true);
    upsertStage('verificado');
  }

  async function handlePay() {
    setPaying(true);
    setPayError(null);
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId: room.id }),
    });
    setPaying(false);
    if (res.ok) {
      const { url } = await res.json();
      if (url) {
        window.location.href = url;
        return;
      }
    }
    // 501 es el único caso en que el servidor dice "Stripe no está configurado".
    // Con cualquier otro error (red, clave inválida, Stripe caído) mostrar
    // "Reserva confirmada" le estaría diciendo al cliente que pagó cuando no pagó.
    if (res.status !== 501) {
      setPayError('No pudimos iniciar el pago. Vuelve a intentarlo en unos minutos.');
      return;
    }
    setPayError('Modo demo: Stripe todavía no está conectado (ver SETUP.md). Pago simulado.');
    setConfirmed(true);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <span className="inline-block rounded-full bg-vivi-mintLight px-3 py-1 text-xs font-bold text-red-700">
          Vivienda habitual · mínimo 6 meses
        </span>

        <ol className="mt-5 space-y-4">
          {steps.map((label, i) => {
            const state = i < step ? 'done' : i === step ? 'current' : 'upcoming';
            return (
              <li key={label} className="flex items-center gap-4">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    state === 'done'
                      ? 'bg-vivi-mint text-vivi-navy'
                      : state === 'current'
                        ? 'bg-vivi-navy text-white'
                        : 'bg-slate-100 text-vivi-muted'
                  }`}
                >
                  {i + 1}
                </span>
                <span
                  className={`text-sm font-semibold ${
                    state === 'upcoming' ? 'text-vivi-muted' : 'text-vivi-ink'
                  }`}
                >
                  {label}
                </span>
              </li>
            );
          })}
        </ol>

        {step === 0 && (
          <div className="mt-6 rounded-xl bg-slate-50 p-4">
            {kycVerified ? (
              <p className="text-sm font-semibold text-red-700">✓ Identidad verificada</p>
            ) : (
              <>
                <p className="text-sm text-vivi-muted">
                  Verifica tu identidad con documento + selfie para poder reservar.
                </p>
                <button
                  onClick={handleVerifyKyc}
                  className="mt-3 rounded-lg bg-vivi-navy px-4 py-2 text-sm font-semibold text-white"
                >
                  Verificar identidad con Didit
                </button>
              </>
            )}
            {kycNote && <p className="mt-2 text-xs text-vivi-muted">{kycNote}</p>}
          </div>
        )}

        {!confirmed ? (
          <div className="mt-8 flex gap-3">
            {step > 0 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-vivi-ink"
              >
                Atrás
              </button>
            )}
            <button
              disabled={kycRequired || paying}
              onClick={() => {
                if (isLastStep) {
                  handlePay();
                } else {
                  setStep((s) => s + 1);
                }
              }}
              className="rounded-xl bg-vivi-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-vivi-navyLight disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLastStep ? (paying ? 'Redirigiendo a pago…' : 'Pagar y reservar') : 'Continuar'}
            </button>
            {payError && <p className="self-center text-xs text-vivi-muted">{payError}</p>}
          </div>
        ) : (
          <div className="mt-8 rounded-xl bg-vivi-mintLight p-6 text-red-800">
            <p className="font-bold">Reserva confirmada</p>
            <p className="mt-2 text-sm">
              Pago recibido. El asesor y la agenda de visitas ya están disponibles, junto con
              alternativas similares dentro del mismo rango de precio.
            </p>
          </div>
        )}
      </div>

      <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="text-lg font-bold text-vivi-ink">Resumen de reserva</h3>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-vivi-muted">Habitación</dt>
            <dd className="font-medium text-vivi-ink">{room.title}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-vivi-muted">Alquiler mensual</dt>
            <dd className="font-medium text-vivi-ink">{room.price.toFixed(2)} €</dd>
          </div>
          {confirmed ? (
            <>
              <div className="flex justify-between">
                <dt className="text-vivi-muted">Fianza (1 mensualidad)</dt>
                <dd className="font-bold text-vivi-ink">{deposit.toFixed(2)} €</dd>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-3 text-base">
                <dt className="font-bold text-vivi-ink">TOTAL PAGADO</dt>
                <dd className="font-extrabold text-vivi-ink">{total.toFixed(2)} €</dd>
              </div>
            </>
          ) : (
            <div className="flex justify-between border-t border-slate-200 pt-3 text-base">
              <dt className="font-bold text-vivi-ink">TOTAL HOY</dt>
              <dd className="font-extrabold text-vivi-ink">{total.toFixed(2)} €</dd>
            </div>
          )}
        </dl>
      </aside>
    </div>
  );
}
