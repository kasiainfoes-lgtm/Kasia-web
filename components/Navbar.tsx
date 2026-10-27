import Link from 'next/link';
import { getSessionUser, getOwnProfile } from '@/lib/supabase/session.server';
import { isAdminEmail } from '@/lib/admin-auth';
import HeaderActions from '@/components/HeaderActions';

export default async function Navbar() {
  const user = await getSessionUser();
  const isAdmin = isAdminEmail(user?.email);

  // Se pide el perfil para cualquier usuario logueado (admin incluido, por
  // la foto/nombre), pero el estado de inquilino (approved/isOwner) solo
  // importa para quien no es del equipo de Kasia: no tiene sentido
  // mostrarle "Completar formulario" o "Ver habitaciones" a un admin como
  // si fuera un cliente.
  const profile = user ? await getOwnProfile(user.id) : null;
  const isOwner = !isAdmin && profile?.role === 'owner';
  const approved = !isAdmin && profile?.applicationStatus === 'APPROVED';

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
          avatarUrl={profile?.avatarUrl ?? null}
          displayName={profile?.fullName ?? null}
          catalogHref={catalogHref}
          catalogLabel={catalogLabel}
          faqHref={faqHref}
        />
      </div>
    </header>
  );
}
