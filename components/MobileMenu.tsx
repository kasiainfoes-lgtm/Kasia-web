'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function MobileMenu({
  catalogHref,
  catalogNavLabel,
  catalogCtaLabel,
  showAdminLink,
}: {
  catalogHref: string;
  catalogNavLabel: string;
  catalogCtaLabel: string;
  showAdminLink: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="sm:hidden">
      <button
        type="button"
        aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-vivi-ink"
      >
        {open ? (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M6 18L18 6" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full border-b border-slate-200 bg-white px-6 py-4 shadow-lg">
          <nav className="flex flex-col gap-4 text-sm font-medium text-vivi-ink">
            <Link href={catalogHref} onClick={() => setOpen(false)}>
              {catalogNavLabel}
            </Link>
            <Link href="/#faq" onClick={() => setOpen(false)}>
              Preguntas frecuentes
            </Link>
            {showAdminLink && (
              <Link href="/admin" onClick={() => setOpen(false)}>
                Panel interno
              </Link>
            )}
            <Link
              href={catalogHref}
              onClick={() => setOpen(false)}
              className="mt-2 rounded-full bg-vivi-navy px-5 py-2.5 text-center text-sm font-semibold text-white"
            >
              {catalogCtaLabel}
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}
