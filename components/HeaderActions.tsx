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

export default function HeaderActions({
  isAdmin,
  email,
  catalogHref,
  catalogLabel,
  faqHref,
}: {
  isAdmin: boolean;
  email: string | null;
  catalogHref: string;
  catalogLabel: string;
  faqHref: string;
}) {
  const pathname = usePathname();

  if (isAdmin) {
    const onAdminHome = pathname === '/admin';
    return (
      <>
        {!onAdminHome && (
          <nav className="hidden items-center gap-8 text-sm font-medium text-vivi-muted sm:flex">
            <Link href="/admin" className="hover:text-vivi-navy">
              Panel interno
            </Link>
          </nav>
        )}
        <div className="flex items-center gap-3">
          <AuthButton email={email} />
          <MobileMenu isAdmin catalogHref="/admin" catalogCtaLabel="Panel interno" faqHref="/admin" />
        </div>
      </>
    );
  }

  const onCatalog = sameTarget(catalogHref, pathname);
  const onFaq = sameTarget(faqHref, pathname);

  return (
    <>
      {!onFaq && (
        <nav className="hidden items-center gap-8 text-sm font-medium text-vivi-muted sm:flex">
          <Link href={faqHref} className="hover:text-vivi-navy">
            Preguntas frecuentes
          </Link>
        </nav>
      )}
      <div className="flex items-center gap-3">
        <AuthButton email={email} />
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
    </>
  );
}
