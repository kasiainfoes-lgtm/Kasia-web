'use client';

import { useEffect, useState } from 'react';
import type { Room } from '@/lib/rooms';
import { calculateBookingTotal } from '@/lib/rooms';
import { createClient } from '@/lib/supabase/client';
import BookingTerms from '@/components/BookingTerms';
import TransferPayment from '@/components/TransferPayment';
import type { OwnBooking } from '@/lib/bookings.server';

const steps = ['Comprobación de identidad', 'Aceptar condiciones', 'Transferencia'];

export default function BookingWizard({
  room,
  initialBooking,
}: {
  room: Room;
  initialBooking: OwnBooking | null;
}) {
  const supabase = createClient();
  const status = initialBooking?.status ?? null;
  const alreadyVerified = status === 'verificado' || status === 'revision' || status === 'pagado';
  const termsAlreadyAccepted = !!initialBooking?.termsAcceptedAt;

  const [step, setStep] = useState(termsAlreadyAccepted ? 2 : alreadyVerified ? 1 : 0);
  const [confirmed, setConfirmed] = useState(status === 'pagado');
  const [pendingReview, setPendingReview] = useState(status === 'revision');
  const [rejectionNote, setRejectionNote] = useState(initialBooking?.transferReviewRejectionNote ?? null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [kycVerified, setKycVerified] = useState(alreadyVerified);
  const [termsAccepted, setTermsAccepted] = useState(termsAlreadyAccepted);
  const [kycNote, setKycNote] = useState<string | null>(null);
  const { deposit, total } = calculateBookingTotal(room.price);

  useEffect(() => {
    supabase?.auth.getUser().then(({ data }) => setUserEmail(data.user?.email ?? null));
  }, [supabase]);

  // Solo registra la etapa 'nuevo' si todavía no existe ninguna reserva para
  // esta persona y habitación — si ya había una más avanzada (verificado,
  // en revisión, pagado) del lado del servidor, esto la pisaba de vuelta a
  // 'nuevo' cada vez que la página se recargaba (por ejemplo, al volver de Didit).
  useEffect(() => {
    if (!userEmail || status) return;
    upsertStage('nuevo');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userEmail, status]);

  const isLastStep = step === steps.length - 1;
  const kycRequired = step === 0 && !kycVerified;
  const termsRequired = step === 1 && !termsAccepted;

  function upsertStage(stageStatus: 'nuevo' | 'verificado', termsAcceptedNow = false) {
    fetch('/api/bookings/upsert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId: room.id, status: stageStatus, termsAccepted: termsAcceptedNow }),
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

        {step === 1 && (
          <BookingTerms
            roomTitle={room.title}
            zone={room.zone}
            price={room.price}
            deposit={deposit}
            accepted={termsAccepted}
            onAcceptedChange={setTermsAccepted}
          />
        )}

        {confirmed ? (
          <div className="mt-8 rounded-xl bg-vivi-mintLight p-6 text-red-800">
            <p className="font-bold">Reserva confirmada</p>
            <p className="mt-2 text-sm">
              Pago recibido. El asesor y la agenda de visitas ya están disponibles, junto con
              alternativas similares dentro del mismo rango de precio.
            </p>
          </div>
        ) : isLastStep ? (
          <TransferPayment
            room={room}
            deposit={deposit}
            pendingReview={pendingReview}
            rejectionNote={rejectionNote}
            onSubmitted={() => {
              setPendingReview(true);
              setRejectionNote(null);
            }}
          />
        ) : (
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
              disabled={kycRequired || termsRequired}
              onClick={() => {
                // Deja constancia de cuándo aceptó las condiciones, antes de pagar.
                if (step === 1) upsertStage('verificado', true);
                setStep((s) => s + 1);
              }}
              className="rounded-xl bg-vivi-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-vivi-navyLight disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continuar
            </button>
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
              <dt className="font-bold text-vivi-ink">TOTAL A TRANSFERIR</dt>
              <dd className="font-extrabold text-vivi-ink">{total.toFixed(2)} €</dd>
            </div>
          )}
        </dl>
      </aside>
    </div>
  );
}
