import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import PublicShowcase from '@/components/PublicShowcase';

// Depende de la sesión (redirige a /rooms si ya está aprobado): nunca cachear.
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const supabase = createClient();
  let pendingReview = false;

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('application_status')
        .eq('id', user.id)
        .single();

      if (profile?.application_status === 'APPROVED') redirect('/rooms');
      pendingReview = !!profile;
    }
  }

  return (
    <>
      <section className="relative overflow-hidden bg-vivi-navy">
        <div className="absolute right-[14%] top-8 h-20 w-20 rounded-full bg-vivi-mint/90" />
        <div className="absolute bottom-8 left-[8%] h-24 w-24 rounded-full bg-vivi-coral/90" />
        <div className="relative mx-auto max-w-6xl px-6 py-20 sm:py-28">
          <span className="inline-block rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-vivi-mint">
            Valencia · vivienda habitual · mínimo 6 meses
          </span>
          <h1 className="mt-6 max-w-2xl text-3xl font-extrabold leading-tight text-white sm:text-4xl">
            Alquiler residencial, verificado y pensado para quedarte.
          </h1>
          <p className="mt-4 max-w-xl text-sm text-slate-300 sm:text-base">
            Contanos qué buscás y en dos minutos te decimos si tenemos disponibilidad para vos. El
            catálogo completo, con precios y fechas exactas, se desbloquea después.
          </p>

          {pendingReview && (
            <p className="mt-6 inline-block rounded-lg bg-white/10 px-4 py-2.5 text-sm text-slate-200">
              Ya recibimos tu perfil de búsqueda y lo estamos revisando.
            </p>
          )}

          <Link
            href="/apply"
            className="mt-8 inline-flex rounded-xl bg-vivi-mint px-6 py-3 text-sm font-bold text-vivi-navy hover:brightness-95"
          >
            Encontrar mi habitación
          </Link>
        </div>
      </section>

      <PublicShowcase />

      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-xs font-bold uppercase tracking-wide text-vivi-mint">Cómo funciona</p>
          <h2 className="mt-2 text-2xl font-extrabold text-vivi-ink sm:text-3xl">
            Tres pasos antes de ver la disponibilidad real.
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            <Step n={1} title="Contanos qué buscás" desc="Zona, presupuesto, para cuándo y cómo vas a vivir." />
            <Step
              n={2}
              title="Evaluamos tu compatibilidad"
              desc="En segundos revisamos tu perfil contra nuestra disponibilidad real."
            />
            <Step
              n={3}
              title="Ves la disponibilidad real"
              desc="Si hay match, creás tu cuenta y ves habitaciones, precios y fechas exactas."
            />
          </div>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-6xl px-6 py-20">
        <p className="text-xs font-bold uppercase tracking-wide text-vivi-mint">Preguntas frecuentes</p>
        <h2 className="mt-2 text-3xl font-extrabold text-vivi-ink sm:text-4xl">
          Solo vivienda habitual: estancia mínima de 6 meses.
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="font-bold text-vivi-ink">¿Puedo ver el catálogo sin completar el formulario?</p>
            <p className="mt-2 text-sm text-vivi-muted">
              No. El inventario real (precios y fechas exactas) solo se muestra después de completar
              tu perfil de búsqueda y que evaluemos tu compatibilidad — toma menos de dos minutos.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="font-bold text-vivi-ink">¿Qué pago al reservar?</p>
            <p className="mt-2 text-sm text-vivi-muted">
              Una fianza equivalente a una mensualidad más una comisión fija de servicio de 50 €, en
              un único pago.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="font-bold text-vivi-ink">¿Qué pasa después de reservar?</p>
            <p className="mt-2 text-sm text-vivi-muted">
              Se desbloquean el asesor, la agenda de visitas y alternativas similares dentro del mismo
              rango de precio.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="font-bold text-vivi-ink">¿Aceptan estancias cortas?</p>
            <p className="mt-2 text-sm text-vivi-muted">
              No. Todas las propiedades del catálogo son solo para vivienda habitual, con una estancia
              mínima de 6 meses.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

function Step({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-6">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-vivi-mintLight text-sm font-bold text-emerald-700">
        {n}
      </span>
      <p className="mt-4 font-bold text-vivi-ink">{title}</p>
      <p className="mt-1.5 text-sm text-vivi-muted">{desc}</p>
    </div>
  );
}
