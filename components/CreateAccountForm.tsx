'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function CreateAccountForm({ email, appId }: { email: string; appId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setLoading(true);
    setError(null);
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, appId }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setLoading(false);
      setError(data.error ?? 'No pudimos crear la cuenta.');
      return;
    }

    if (!supabase) {
      setLoading(false);
      setError('El login todavía no está conectado.');
      return;
    }

    // La cuenta ya está creada del lado del servidor, pero el inicio de
    // sesión lo hace el navegador: así la cookie queda escrita directo acá
    // (document.cookie), sin depender de que un Set-Cookie llegue bien de
    // vuelta a través de un proxy — que era por qué, tras elegir la
    // contraseña, terminaba igual en /login en vez de entrar directo.
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: data.email ?? email,
      password,
    });
    setLoading(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    router.push('/rooms');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-vivi-muted">
          Email
        </label>
        <input
          value={email}
          disabled
          className="mt-2 w-full rounded-lg border border-stone-200 bg-stone-100 px-3 py-2 text-sm text-vivi-muted"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-vivi-muted">
          Contraseña
        </label>
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
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
          className="mt-2 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-vivi-navy px-5 py-3 text-sm font-semibold text-white hover:bg-vivi-navyLight disabled:opacity-60"
      >
        {loading ? 'Creando cuenta…' : 'Crear cuenta y ver habitaciones'}
      </button>
    </form>
  );
}
