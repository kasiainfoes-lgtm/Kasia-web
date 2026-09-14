'use client';

import Link from 'next/link';

// Boundary de error para cualquier página dentro del layout normal (Navbar +
// Footer siguen visibles). Sin esto, cualquier excepción no manejada (por
// ejemplo un problema de red pasajero al consultar Supabase) mostraba el
// "Internal Server Error" en blanco de Next por defecto, sin forma de
// reintentar ni de saber qué pasó.
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="mx-auto max-w-md px-6 py-24 text-center">
      <p className="text-xs font-bold uppercase tracking-wide text-vivi-mint">Kasia</p>
      <h1 className="mt-2 text-2xl font-extrabold text-vivi-ink">Algo salió mal</h1>
      <p className="mt-3 text-sm text-vivi-muted">
        Tuvimos un problema al cargar esta página. Probablemente fue algo pasajero — inténtalo de
        nuevo en un momento.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <button
          onClick={() => reset()}
          className="rounded-xl bg-vivi-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-vivi-navyLight"
        >
          Reintentar
        </button>
        <Link
          href="/"
          className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-vivi-ink hover:border-vivi-navy"
        >
          Volver al inicio
        </Link>
      </div>
    </section>
  );
}
