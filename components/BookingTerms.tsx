'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import BookingTermsContent from '@/components/BookingTermsContent';

export default function BookingTerms({
  roomTitle,
  zone,
  price,
  deposit,
  accepted,
  onAcceptedChange,
}: {
  roomTitle: string;
  zone: string;
  price: number;
  deposit: number;
  accepted: boolean;
  onAcceptedChange: (accepted: boolean) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [readToEnd, setReadToEnd] = useState(false);

  // Si el texto entra entero sin scroll (pantalla grande), no habría forma de
  // llegar "al final": en ese caso ya está leído desde el principio.
  const checkScrolled = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 8;
    if (atBottom) setReadToEnd(true);
  }, []);

  useEffect(() => {
    checkScrolled();
  }, [checkScrolled]);

  return (
    <div className="mt-6">
      <p className="text-sm font-bold text-vivi-ink">Condiciones de la reserva</p>
      <p className="mt-1 text-xs text-vivi-muted">
        Léelas hasta el final para poder aceptarlas y continuar al pago.
      </p>

      <div
        ref={scrollRef}
        onScroll={checkScrolled}
        className="mt-3 h-64 overflow-y-auto rounded-xl border border-slate-300 bg-slate-50 p-4 text-sm leading-relaxed text-vivi-ink"
      >
        <BookingTermsContent roomTitle={roomTitle} zone={zone} price={price} deposit={deposit} />

        <p className="mt-4 border-t border-slate-300 pt-3 text-xs text-vivi-muted">
          Al marcar la casilla de abajo declaras haber leído y aceptado estas condiciones. Quedará
          registrada la fecha y hora de tu aceptación junto con tu reserva.
        </p>
      </div>

      {!readToEnd && (
        <p className="mt-2 text-xs font-semibold text-amber-700">
          ↓ Desplázate hasta el final del texto para poder aceptarlo.
        </p>
      )}

      <label
        className={`mt-3 flex items-start gap-3 rounded-xl border p-4 text-sm ${
          readToEnd
            ? 'cursor-pointer border-slate-300 bg-white text-vivi-ink'
            : 'cursor-not-allowed border-slate-200 bg-slate-50 text-vivi-muted'
        }`}
      >
        <input
          type="checkbox"
          checked={accepted}
          disabled={!readToEnd}
          onChange={(e) => onAcceptedChange(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-vivi-navy disabled:cursor-not-allowed"
        />
        <span className="font-semibold">
          He leído y acepto las condiciones de la reserva y la política de la vivienda.
        </span>
      </label>
    </div>
  );
}
