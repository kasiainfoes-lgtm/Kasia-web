'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function AuthButton({
  email,
  avatarUrl,
  displayName,
}: {
  email: string | null;
  avatarUrl: string | null;
  displayName: string | null;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  if (!email) {
    return (
      <Link
        href="/login"
        className="rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-vivi-ink hover:border-vivi-navy"
      >
        Iniciar sesión
      </Link>
    );
  }

  const initial = (displayName || email).charAt(0).toUpperCase();

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Tu cuenta"
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-stone-300 bg-vivi-mintLight text-sm font-bold text-vivi-mint hover:border-vivi-navy"
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          initial
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-stone-200 bg-vivi-card p-2 shadow-lg">
          {displayName && (
            <p className="truncate px-3 py-1.5 text-xs font-semibold text-vivi-muted">{displayName}</p>
          )}
          <Link
            href="/perfil"
            onClick={() => setOpen(false)}
            className="block rounded-lg px-3 py-2 text-sm font-medium text-vivi-ink hover:bg-vivi-bg"
          >
            Editar perfil
          </Link>
          <button
            type="button"
            onClick={async () => {
              setOpen(false);
              await supabase?.auth.signOut();
              router.push('/');
              router.refresh();
            }}
            className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-vivi-ink hover:bg-vivi-bg"
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
