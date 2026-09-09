import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { isAdminEmail } from '@/lib/admin-auth';
import AuthButton from '@/components/AuthButton';
import MobileMenu from '@/components/MobileMenu';

export default async function Navbar() {
  const supabase = createClient();
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;
  const showAdminLink = isAdminEmail(user?.email);

  let approved = false;
  if (supabase && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('application_status')
      .eq('id', user.id)
      .single();
    approved = profile?.application_status === 'APPROVED';
  }

  const catalogHref = approved ? '/rooms' : '/apply';
  const catalogLabel = approved ? 'Ver habitaciones' : 'Encontrar habitación';

  return (
    <header className="relative border-b border-slate-200/70 bg-white/80 backdrop-blur sticky top-0 z-40">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="text-2xl font-black tracking-tight text-vivi-navy">Kasia</span>
          <span className="text-sm font-medium text-vivi-muted">Valencia</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-vivi-muted sm:flex">
          <Link href={catalogHref} className="hover:text-vivi-navy">
            {approved ? 'Catálogo' : 'Encontrar habitación'}
          </Link>
          <Link href="/#faq" className="hover:text-vivi-navy">
            Preguntas frecuentes
          </Link>
          {showAdminLink && (
            <Link href="/admin" className="hover:text-vivi-navy">
              Panel interno
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-3">
          <AuthButton email={user?.email ?? null} />
          <Link
            href={catalogHref}
            className="hidden rounded-full bg-vivi-navy px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-vivi-navyLight sm:inline-block"
          >
            {catalogLabel}
          </Link>
          <MobileMenu
            catalogHref={catalogHref}
            catalogNavLabel={approved ? 'Catálogo' : 'Encontrar habitación'}
            catalogCtaLabel={catalogLabel}
            showAdminLink={showAdminLink}
          />
        </div>
      </div>
    </header>
  );
}
