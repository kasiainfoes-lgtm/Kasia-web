'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

// Condiciones de reserva, tomadas del contrato de TATC RENT AND INVESTMENTS SL.
// El IBAN del contrato en papel no va acá a propósito: en la web el cobro pasa
// por Stripe, y publicar la cuenta bancaria solo abriría la puerta a que
// alguien la suplante.
const ARRENDADORA = 'TATC RENT AND INVESTMENTS SL';
const CIF = 'B67988618';
const DOMICILIO = 'Calle Campamento 8';
const DIAS_PARA_FIRMAR = 15;

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
        <p className="font-bold">RESERVA DE ALQUILER DE HABITACIÓN</p>
        <p className="mt-3 text-vivi-muted">
          Entregas la cantidad indicada más abajo en concepto de <strong>reserva</strong>, cuantía
          correspondiente a una mensualidad de renta, a <strong>{ARRENDADORA}</strong>, con C.I.F. nº{' '}
          {CIF} y domicilio en {DOMICILIO}.
        </p>

        <p className="mt-4 font-bold">Habitación reservada</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-vivi-muted">
          <li>
            {roomTitle} — {zone}, Valencia
          </li>
          <li>Precio del alquiler: {price.toFixed(2)} € / mes</li>
          <li>Fianza: UNA mensualidad ({deposit.toFixed(2)} €)</li>
          <li>
            Gastos de entrada: pago único, para sábanas y otros enseres, preparación de la
            habitación y servicios adicionales. El importe te lo confirma tu asesora antes de la
            firma del contrato.
          </li>
        </ul>

        <p className="mt-4 font-bold">Plazo para firmar el contrato</p>
        <p className="mt-2 text-vivi-muted">
          El contrato de alquiler se firmará como máximo en {DIAS_PARA_FIRMAR} días desde la fecha de
          esta reserva. Hasta dicha fecha, la Empresa se compromete a no comercializar la propiedad.
        </p>

        <p className="mt-4 font-bold">Si el contrato no llega a firmarse</p>
        <p className="mt-2 text-vivi-muted">
          En caso de no formalizarse el contrato de arrendamiento por causas imputables a la parte
          arrendataria, ésta perdería la reserva entregada. Si fuera por motivos de la parte
          arrendadora, se devolverá la reserva íntegra.
        </p>

        <p className="mt-4 font-bold">Al formalizar el contrato</p>
        <p className="mt-2 text-vivi-muted">
          La cantidad entregada en este acto irá a cuenta de la fianza por la parte arrendataria,
          correspondiente a una mensualidad de renta.
        </p>

        <p className="mt-4 font-bold">Uso de la vivienda</p>
        <p className="mt-2 text-vivi-muted">
          La habitación se destina a vivienda habitual, con una estancia mínima de 6 meses. No se
          aceptan estancias cortas ni uso turístico.
        </p>

        <p className="mt-4 font-bold">Pago</p>
        <p className="mt-2 text-vivi-muted">
          El importe de la reserva se abona a través de la pasarela de pago segura de esta web. Kasia
          no solicita transferencias a cuentas enviadas por correo o mensajería: si recibes una
          petición así, no la atiendas y avísanos.
        </p>

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
