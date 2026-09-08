'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/rooms';
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) {
      setError('El login todavía no está conectado. Configurá Supabase (ver SETUP.md).');
      return;
    }
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <section className="mx-auto max-w-md px-6 py-20">
      <p className="text-xs font-bold uppercase tracking-wide text-vivi-mint">Iniciar sesión</p>
      <h1 className="mt-2 text-3xl font-extrabold text-vivi-ink">Entrá a tu cuenta Kasia</h1>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-vivi-muted">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold uppercase tracking-wide text-vivi-muted">
              Contraseña
            </label>
            <Link href="/forgot-password" className="text-xs font-semibold text-vivi-navy hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-vivi-navy px-5 py-3 text-sm font-semibold text-white hover:bg-vivi-navyLight disabled:opacity-60"
        >
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-vivi-muted">
        ¿No tenés cuenta?{' '}
        <Link href="/apply" className="font-semibold text-vivi-navy">
          Completá tu perfil de búsqueda
        </Link>
      </p>
    </section>
  );
}
