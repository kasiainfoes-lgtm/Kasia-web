// Texto de las condiciones de reserva, tomado del contrato de TATC RENT AND
// INVESTMENTS SL. Vive separado de BookingTerms (que lo envuelve con scroll +
// checkbox obligatorios) para poder mostrarlo de nuevo, solo de lectura, junto
// a los datos de la transferencia en el paso de pago.
const ARRENDADORA = 'TATC RENT AND INVESTMENTS SL';
const CIF = 'B67988618';
const DOMICILIO = 'Calle Campamento 8';
const DIAS_PARA_FIRMAR = 15;

export default function BookingTermsContent({
  roomTitle,
  zone,
  price,
  deposit,
}: {
  roomTitle: string;
  zone: string;
  price: number;
  deposit: number;
}) {
  return (
    <>
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
          habitación y servicios adicionales. El importe te lo confirma tu asesor/a antes de la
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
        El importe de la reserva se abona por transferencia bancaria a la cuenta que se indica en
        el siguiente paso, siempre a nombre de {ARRENDADORA}. Kasia nunca pide transferencias a otra
        cuenta distinta ni por correo o mensajería: si recibes una petición así, no la atiendas y
        avísanos.
      </p>
    </>
  );
}
