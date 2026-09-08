'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function AuthButton({ email }: { email: string | null }) {
  const router = useRouter();
  const supabase = createClient();

  if (!email) {
    return (
      <Link
        href="/login"
        className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-vivi-ink hover:border-vivi-navy"
      >
        Iniciar sesión
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="hidden text-sm text-vivi-muted sm:inline">{email}</span>
      <button
        onClick={async () => {
          await supabase?.auth.signOut();
          router.refresh();
        }}
        className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-vivi-ink hover:border-vivi-navy"
      >
        Cerrar sesión
      </button>
    </div>
  );
}
