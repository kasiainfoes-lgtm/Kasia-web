import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getApplicationById } from '@/lib/applications.server';
import { APP_ID_COOKIE } from '@/lib/apply-session';
import CreateAccountForm from '@/components/CreateAccountForm';

export const dynamic = 'force-dynamic';

export default async function SignupPage({ searchParams }: { searchParams: { app?: string } }) {
  // El id de la solicitud puede venir de la cookie (justo después de /apply,
  // en el mismo navegador) o de ?app=<id> (el link del email de "aprobado",
  // que puede abrirse días después y en otro dispositivo).
  const appId = searchParams.app || cookies().get(APP_ID_COOKIE)?.value;
  if (!appId) redirect('/apply');

  const application = await getApplicationById(appId);
  if (!application || application.status !== 'APPROVED') redirect('/apply');

  return (
    <section className="mx-auto max-w-md px-6 py-20">
      <p className="text-xs font-bold uppercase tracking-wide text-vivi-mint">Crear cuenta</p>
      <h1 className="mt-2 text-3xl font-extrabold text-vivi-ink">Ya casi estás, {application.name}</h1>
      <p className="mt-3 text-sm text-vivi-muted">
        Elige una contraseña para tu cuenta Kasia y entra directo al catálogo de habitaciones
        disponibles para tu búsqueda.
      </p>

      <CreateAccountForm email={application.email} appId={application.id} />

      <p className="mt-6 text-center text-sm text-vivi-muted">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login?next=/rooms" className="font-semibold text-vivi-navy">
          Inicia sesión
        </Link>
      </p>
    </section>
  );
}
