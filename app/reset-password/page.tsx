'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const INVALID_LINK_MESSAGE =
  'Este link ya venció o no es válido. Pedí uno nuevo desde "¿Olvidaste tu contraseña?".';

export default function ResetPasswordPage() {
  const supabase = createClient();
  const [status, setStatus] = useState<'checking' | 'ready' | 'invalid'>('checking');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setStatus('invalid');
      return;
    }

    // El link del email manda acá con ?code=... (flujo PKCE). Hay que
    // canjearlo por una sesión de "recuperación" antes de poder cambiar la
    // contraseña — el cliente no lo hace solo con solo detectar la URL.
    async function prepare() {
      const code = new URLSearchParams(window.location.search).get('code');
      if (code) {
        const { error } = await supabase!.auth.exchangeCodeForSession(code);
        if (error) {
          setStatus('invalid');
          return;
        }
        setStatus('ready');
        return;
      }

      const { data } = await supabase!.auth.getSession();
      setStatus(data.session ? 'ready' : 'invalid');
    }

    prepare();
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (!supabase) {
      setError('El login todavía no está conectado. Configurá Supabase (ver SETUP.md).');
      return;
    }
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError(error.message.toLowerCase().includes('session') ? INVALID_LINK_MESSAGE : error.message);
      return;
    }
    await supabase.auth.signOut();
    setDone(true);
  }

  if (done) {
    return (
      <section className="mx-auto max-w-md px-6 py-20 text-center">
        <p className="text-xs font-bold uppercase tracking-wide text-vivi-mint">Listo</p>
        <h1 className="mt-2 text-2xl font-extrabold text-vivi-ink">Contraseña actualizada</h1>
        <p className="mt-3 text-sm text-vivi-muted">Ya podés iniciar sesión con tu nueva contraseña.</p>
        <Link
          href="/login"
          className="mt-8 inline-block rounded-xl bg-vivi-navy px-6 py-3 text-sm font-bold text-white hover:bg-vivi-navyLight"
        >
          Iniciar sesión
        </Link>
      </section>
    );
  }

  if (status === 'checking') {
    return (
      <section className="mx-auto max-w-md px-6 py-20 text-center">
        <p className="text-sm text-vivi-muted">Comprobando tu link…</p>
      </section>
    );
  }

  if (status === 'invalid') {
    return (
      <section className="mx-auto max-w-md px-6 py-20 text-center">
        <p className="text-xs font-bold uppercase tracking-wide text-vivi-mint">Recuperar acceso</p>
        <h1 className="mt-2 text-2xl font-extrabold text-vivi-ink">Link no válido</h1>
        <p className="mt-3 text-sm text-vivi-muted">{INVALID_LINK_MESSAGE}</p>
        <Link
          href="/forgot-password"
          className="mt-8 inline-block rounded-xl bg-vivi-navy px-6 py-3 text-sm font-bold text-white hover:bg-vivi-navyLight"
        >
          Pedir un link nuevo
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-md px-6 py-20">
      <p className="text-xs font-bold uppercase tracking-wide text-vivi-mint">Recuperar acceso</p>
      <h1 className="mt-2 text-3xl font-extrabold text-vivi-ink">Elegí una contraseña nueva</h1>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-vivi-muted">
            Contraseña nueva
          </label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-vivi-muted">
            Repetir contraseña
          </label>
          <input
            type="password"
            required
            minLength={6}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-vivi-navy px-5 py-3 text-sm font-semibold text-white hover:bg-vivi-navyLight disabled:opacity-60"
        >
          {loading ? 'Guardando…' : 'Guardar contraseña nueva'}
        </button>
      </form>
    </section>
  );
}
