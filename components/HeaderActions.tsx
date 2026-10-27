'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AuthButton from '@/components/AuthButton';
import MobileMenu from '@/components/MobileMenu';

// Antes "Catálogo"/"Encontrar habitación" (link de texto) y "Ver
// habitaciones"/"Encontrar habitación" (botón) apuntaban al mismo lugar y
// aparecían los dos a la vez — y encima ninguno de los dos se escondía
// estando ya en esa página. Acá queda un solo link por destino, y se
// esconde cuando ya estás ahí (comparando contra el pathname, sin el '#').
function sameTarget(href: string, pathname: string): boolean {
  return href.split('#')[0] === pathname;
}

type Panel = { href: string; label: string } | null;

export default function HeaderActions({
  panel,
  email,
  avatarUrl,
  displayName,
  catalogHref,
  catalogLabel,
  faqHref,
}: {
  // No-null para admin ("Panel interno" → /admin) y para propietarios
  // ("Mis propiedades" → /admin/propiedades) — ambos ven su propio panel en
  // vez del flujo de inquilino (completar formulario / ver habitaciones).
  panel: Panel;
  email: string | null;
  avatarUrl: string | null;
  displayName: string | null;
  catalogHref: string;
  catalogLabel: string;
  faqHref: string;
}) {
  const pathname = usePathname();

  if (panel) {
    const onPanelHome = pathname === panel.href;
    return (
      <div className="flex items-center gap-6">
        {!onPanelHome && (
          <nav className="hidden items-center gap-8 text-sm font-medium text-vivi-muted sm:flex">
            <Link href={panel.href} className="hover:text-vivi-navy">
              {panel.label}
            </Link>
          </nav>
        )}
        <div className="flex items-center gap-3">
          <AuthButton email={email} avatarUrl={avatarUrl} displayName={displayName} />
          <MobileMenu isAdmin catalogHref={panel.href} catalogCtaLabel={panel.label} faqHref={panel.href} />
        </div>
      </div>
    );
  }

  const onCatalog = sameTarget(catalogHref, pathname);
  const onFaq = sameTarget(faqHref, pathname);

  return (
    <div className="flex items-center gap-6">
      {!onFaq && (
        <nav className="hidden items-center gap-8 text-sm font-medium text-vivi-muted sm:flex">
          <Link href={faqHref} className="hover:text-vivi-navy">
            Preguntas frecuentes
          </Link>
        </nav>
      )}
      <div className="flex items-center gap-3">
        <AuthButton email={email} avatarUrl={avatarUrl} displayName={displayName} />
        {!onCatalog && (
          <Link
            href={catalogHref}
            className="hidden rounded-full bg-vivi-navy px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-vivi-navyLight sm:inline-block"
          >
            {catalogLabel}
          </Link>
        )}
        <MobileMenu
          isAdmin={false}
          catalogHref={catalogHref}
          catalogCtaLabel={catalogLabel}
          faqHref={faqHref}
          hideCatalog={onCatalog}
          hideFaq={onFaq}
        />
      </div>
    </div>
  );
}
