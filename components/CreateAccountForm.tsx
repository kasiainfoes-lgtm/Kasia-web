'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateAccountForm({ email }: { email: string }) {
  const router = useRouter();
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
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'No pudimos crear la cuenta.' }));
      setError(error);
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
          className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-vivi-muted"
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
        {loading ? 'Creando cuenta…' : 'Crear cuenta y ver habitaciones'}
      </button>
    </form>
  );
}
