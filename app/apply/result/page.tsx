import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getApplicationById } from '@/lib/applications.server';
import { APP_ID_COOKIE, APP_DEMO_STATUS_COOKIE } from '@/lib/apply-session';
import type { ApplicationStatus } from '@/lib/application-scoring';

export const dynamic = 'force-dynamic';

const COPY: Record<ApplicationStatus, { badge: string; title: string; message: string }> = {
  APPROVED: {
    badge: 'Compatible',
    title: 'Buenas noticias',
    message: 'Tenemos habitaciones que pueden encajar con tu búsqueda.',
  },
  REVIEW: {
    badge: 'En revisión',
    title: 'Gracias por completar tu perfil',
    message:
      'Necesitamos revisar algunos datos antes de darte acceso a las habitaciones disponibles.',
  },
  NOT_ELIGIBLE: {
    badge: 'Sin disponibilidad para tu perfil',
    title: 'Gracias por completar tu perfil',
    message:
      'En este momento no podemos ofrecerte acceso al catálogo disponible. Si cambian tus circunstancias o nuestra disponibilidad, podremos volver a revisar tu solicitud.',
  },
};

export default async function ApplyResultPage() {
  const cookieStore = cookies();
  const appId = cookieStore.get(APP_ID_COOKIE)?.value;
  const demoStatus = cookieStore.get(APP_DEMO_STATUS_COOKIE)?.value as ApplicationStatus | undefined;

  let status: ApplicationStatus | null = null;

  if (appId) {
    const application = await getApplicationById(appId);
    status = application?.status ?? null;
  } else if (demoStatus) {
    status = demoStatus;
  }

  if (!status) redirect('/apply');

  const copy = COPY[status];

  return (
    <section className="mx-auto max-w-md px-6 py-24 text-center">
      <span
        className={`inline-block rounded-full px-4 py-1.5 text-xs font-bold ${
          status === 'APPROVED'
            ? 'bg-vivi-mintLight text-emerald-700'
            : status === 'REVIEW'
              ? 'bg-indigo-50 text-indigo-600'
              : 'bg-slate-100 text-vivi-muted'
        }`}
      >
        {copy.badge}
      </span>
      <h1 className="mt-4 text-2xl font-extrabold text-vivi-ink">{copy.title}</h1>
      <p className="mt-3 text-sm leading-relaxed text-vivi-muted">{copy.message}</p>

      {status === 'APPROVED' ? (
        <Link
          href="/signup"
          className="mt-8 inline-block rounded-xl bg-vivi-mint px-6 py-3 text-sm font-bold text-vivi-navy hover:brightness-95"
        >
          Crear cuenta y ver habitaciones
        </Link>
      ) : (
        <Link href="/" className="mt-8 inline-block text-sm font-semibold text-vivi-navy hover:underline">
          ← Volver al inicio
        </Link>
      )}
    </section>
  );
}
