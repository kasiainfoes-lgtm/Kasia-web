'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) {
      setError('El login todavía no está conectado. Configurá Supabase (ver SETUP.md).');
      setStatus('error');
      return;
    }
    setStatus('loading');
    setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      setError(error.message);
      setStatus('error');
      return;
    }
    setStatus('sent');
  }

  if (status === 'sent') {
    return (
      <section className="mx-auto max-w-md px-6 py-20 text-center">
        <p className="text-xs font-bold uppercase tracking-wide text-vivi-mint">Revisá tu email</p>
        <h1 className="mt-2 text-2xl font-extrabold text-vivi-ink">Te mandamos un link</h1>
        <p className="mt-3 text-sm text-vivi-muted">
          Si <strong>{email}</strong> tiene una cuenta, te va a llegar un email con un link para elegir
          una contraseña nueva. Revisá también la carpeta de spam.
        </p>
        <Link
          href="/login"
          className="mt-8 inline-block text-sm font-semibold text-vivi-navy hover:underline"
        >
          ← Volver a iniciar sesión
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-md px-6 py-20">
      <p className="text-xs font-bold uppercase tracking-wide text-vivi-mint">Recuperar acceso</p>
      <h1 className="mt-2 text-3xl font-extrabold text-vivi-ink">¿Olvidaste tu contraseña?</h1>
      <p className="mt-3 text-sm text-vivi-muted">
        Escribí tu email y te mandamos un link para elegir una contraseña nueva.
      </p>

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

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full rounded-xl bg-vivi-navy px-5 py-3 text-sm font-semibold text-white hover:bg-vivi-navyLight disabled:opacity-60"
        >
          {status === 'loading' ? 'Enviando…' : 'Mandarme el link'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-vivi-muted">
        <Link href="/login" className="font-semibold text-vivi-navy">
          ← Volver a iniciar sesión
        </Link>
      </p>
    </section>
  );
}
