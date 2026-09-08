const SAMPLES = [
  { zone: 'Ruzafa', priceFrom: 650, colorFrom: '#BFD9FF', colorTo: '#DCE9FF' },
  { zone: 'Benimaclet', priceFrom: 680, colorFrom: '#E4D9FF', colorTo: '#F0E9FF' },
  { zone: 'El Carmen', priceFrom: 700, colorFrom: '#FFD9CF', colorTo: '#FFEAE4' },
];

export default function PublicShowcase() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <p className="text-xs font-bold uppercase tracking-wide text-vivi-mint">Nuestras habitaciones</p>
      <h2 className="mt-2 text-2xl font-extrabold text-vivi-ink sm:text-3xl">
        Habitaciones pensadas para quedarte.
      </h2>
      <p className="mt-2 max-w-xl text-sm text-vivi-muted">
        Este es el estilo y el estándar que vas a encontrar. La disponibilidad exacta, con precios y
        fechas reales, se desbloquea al completar tu perfil de búsqueda.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        {SAMPLES.map((s) => (
          <div key={s.zone} className="rounded-2xl border border-slate-200 bg-white p-4">
            <div
              className="h-36 rounded-xl"
              style={{ background: `linear-gradient(135deg, ${s.colorFrom}, ${s.colorTo})` }}
            />
            <div className="mt-3 flex items-center justify-between">
              <p className="font-semibold text-vivi-ink">{s.zone}</p>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-vivi-muted">
                Vista previa
              </span>
            </div>
            <p className="text-sm text-vivi-muted">desde {s.priceFrom} € / mes</p>
          </div>
        ))}
      </div>
    </section>
  );
}
