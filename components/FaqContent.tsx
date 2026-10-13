const FAQS = [
  {
    q: '¿Puedo ver el catálogo sin completar el formulario?',
    a: 'No. El inventario real (precios y fechas exactas) solo se muestra después de completar tu perfil de búsqueda y que evaluemos tu compatibilidad — toma menos de dos minutos.',
  },
  {
    q: '¿Qué pago al reservar?',
    a: 'Una fianza equivalente a una mensualidad, en un único pago.',
  },
  {
    q: '¿Qué pasa después de reservar?',
    a: 'Se desbloquean el contacto con tu asesor/a, la agenda de visitas y alternativas similares dentro del mismo rango de precio.',
  },
  {
    q: '¿Aceptan estancias cortas?',
    a: 'No. Todas las propiedades del catálogo son solo para vivienda habitual, con una estancia mínima de 6 meses.',
  },
];

export default function FaqContent() {
  return (
    <div className="mt-10 grid gap-6 sm:grid-cols-2">
      {FAQS.map((item) => (
        <div key={item.q} className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="font-bold text-vivi-ink">{item.q}</p>
          <p className="mt-2 text-sm text-vivi-muted">{item.a}</p>
        </div>
      ))}
    </div>
  );
}
