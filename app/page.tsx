import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Star } from 'lucide-react';
import { getSessionUser, getOwnProfile } from '@/lib/supabase/session.server';
import { getSiteReviews } from '@/lib/reviews.server';
import { formatDateEs } from '@/lib/format';
import PublicShowcase from '@/components/PublicShowcase';

// Depende de la sesión (redirige a /rooms si ya está aprobado): nunca cachear.
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let pendingReview = false;

  const user = await getSessionUser();
  if (user) {
    const profile = await getOwnProfile(user.id);
    if (profile?.applicationStatus === 'APPROVED') redirect('/rooms');
    pendingReview = !!profile;
  }

  const siteReviews = await getSiteReviews();
  const siteAverage =
    siteReviews.length > 0 ? siteReviews.reduce((sum, r) => sum + r.rating, 0) / siteReviews.length : null;

  return (
    <>
      <section className="bg-vivi-bg pt-8 sm:pt-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-vivi-card px-6 py-20 text-center sm:py-28">
            <span className="inline-block rounded-full bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-vivi-mint shadow-sm">
              Valencia · vivienda habitual · mínimo 6 meses
            </span>
            <h1 className="mx-auto mt-6 max-w-2xl text-4xl font-extrabold leading-tight text-vivi-ink sm:text-5xl">
              Alquiler residencial,{' '}
              <span className="font-medium text-vivi-muted">verificado y pensado para quedarte.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base text-vivi-muted">
              Cuéntanos qué buscas y en dos minutos te decimos si tenemos disponibilidad para ti. El
              catálogo completo, con precios y fechas exactas, se desbloquea después.
            </p>

            <div className="mx-auto mt-8 flex flex-col items-center gap-3">
              <Link
                href="/apply"
                className="inline-flex items-center gap-2 rounded-full bg-vivi-navy px-7 py-3.5 text-sm font-bold text-white transition hover:bg-vivi-navyLight"
              >
                Encontrar mi habitación
              </Link>
              <p className="text-xs font-medium text-vivi-muted">Sin compromiso · toma menos de 2 minutos</p>
            </div>

            {pendingReview && (
              <p className="mx-auto mt-6 inline-block rounded-full bg-white px-4 py-2.5 text-sm text-vivi-ink shadow-sm">
                Ya recibimos tu perfil de búsqueda y lo estamos revisando.
              </p>
            )}
          </div>
        </div>
      </section>

      <PublicShowcase />

      <section className="bg-vivi-bg py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow>Cómo funciona</Eyebrow>
            <h2 className="mt-4 text-2xl font-extrabold text-vivi-ink sm:text-3xl">
              Tres pasos antes de ver la disponibilidad real.
            </h2>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            <Step n={1} title="Cuéntanos qué buscas" desc="Zona, presupuesto, para cuándo y cómo vas a vivir." />
            <Step
              n={2}
              title="Evaluamos tu compatibilidad"
              desc="En segundos revisamos tu perfil contra nuestra disponibilidad real."
            />
            <Step
              n={3}
              title="Ves la disponibilidad real"
              desc="Si hay match, creas tu cuenta y ves habitaciones, precios y fechas exactas."
            />
          </div>
        </div>
      </section>

      {siteReviews.length > 0 && (
        <section className="bg-vivi-card py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mx-auto max-w-2xl text-center">
              <Eyebrow>Testimonios</Eyebrow>
              <div className="mt-4 flex items-center justify-center gap-2">
                <h2 className="text-2xl font-extrabold text-vivi-ink sm:text-3xl">
                  Lo que dicen quienes ya alquilaron
                </h2>
                {siteAverage !== null && (
                  <span className="flex items-center gap-1 text-sm font-semibold text-vivi-ink">
                    <Star width={16} height={16} className="fill-vivi-mint text-vivi-mint" />
                    {siteAverage.toFixed(1)}
                  </span>
                )}
              </div>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {siteReviews.slice(0, 6).map((review) => (
                <div key={review.id} className="rounded-2xl border border-stone-200 p-6">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        width={14}
                        height={14}
                        className={n <= review.rating ? 'fill-vivi-mint text-vivi-mint' : 'text-stone-300'}
                      />
                    ))}
                  </div>
                  {review.comment && (
                    <p className="mt-3 text-sm leading-relaxed text-vivi-muted">{review.comment}</p>
                  )}
                  <p className="mt-3 text-xs font-semibold text-vivi-ink">
                    {review.reviewerName} · {formatDateEs(review.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

    </>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex items-center justify-center">
      <div className="absolute inset-x-0 top-1/2 h-px bg-stone-300" />
      <span className="relative inline-block rounded-full border border-stone-300 bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-vivi-mint">
        {children}
      </span>
    </div>
  );
}

function Step({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-vivi-card p-6 text-center">
      <span className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-vivi-mintLight text-sm font-bold text-vivi-mint">
        {n}
      </span>
      <p className="mt-4 font-bold text-vivi-ink">{title}</p>
      <p className="mt-1.5 text-sm text-vivi-muted">{desc}</p>
    </div>
  );
}
