import Link from 'next/link';
import { getSessionUser, getOwnProfile } from '@/lib/supabase/session.server';
import { isAdminEmail } from '@/lib/admin-auth';
import HeaderActions from '@/components/HeaderActions';

export default async function Navbar() {
  const user = await getSessionUser();
  const isAdmin = isAdminEmail(user?.email);

  // Quien administra el sitio no es un inquilino buscando habitación: no
  // tiene sentido mostrarle "Completar formulario" o "Ver habitaciones"
  // como si fuera un cliente — por eso ni se consulta su perfil de inquilino.
  const profile = !isAdmin && user ? await getOwnProfile(user.id) : null;
  const isOwner = !isAdmin && profile?.role === 'owner';
  const approved = profile?.applicationStatus === 'APPROVED';

  const panel = isAdmin
    ? { href: '/admin', label: 'Panel interno' }
    : isOwner
      ? { href: '/admin/propiedades', label: 'Mis propiedades' }
      : null;

  const catalogHref = approved ? '/rooms' : '/apply';
  const catalogLabel = approved ? 'Ver habitaciones' : 'Encontrar habitación';
  const faqHref = '/preguntas-frecuentes';

  return (
    <header className="relative border-b border-stone-200/70 bg-vivi-card/80 backdrop-blur sticky top-0 z-40">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href={panel ? panel.href : '/'} className="flex items-baseline gap-2">
          <span className="text-2xl font-black tracking-tight text-vivi-navy">Kasia</span>
          <span className="text-sm font-medium text-vivi-muted">
            {panel ? 'Panel interno' : 'Valencia'}
          </span>
        </Link>
        <HeaderActions
          panel={panel}
          email={user?.email ?? null}
          catalogHref={catalogHref}
          catalogLabel={catalogLabel}
          faqHref={faqHref}
        />
      </div>
    </header>
  );
}
