'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const INVALID_LINK_MESSAGE =
  'Este enlace ha caducado o no es válido. Pide uno nuevo desde "¿Olvidaste tu contraseña?".';

type Status = 'checking' | 'has_code' | 'confirming' | 'ready' | 'invalid';

export default function ResetPasswordPage() {
  const supabase = createClient();
  const [status, setStatus] = useState<Status>('checking');
  const [code, setCode] = useState<string | null>(null);
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

    // El link del email trae ?code=... (flujo PKCE). Muchos clientes de
    // correo (Gmail incluido) "visitan" los links automáticamente para
    // escanearlos en busca de phishing antes de que la persona los toque —
    // y como este código solo sirve una vez, ese escaneo lo gastaba antes de
    // tiempo. Por eso NO lo canjeamos solo al cargar la página: esperamos a
    // que la persona toque un botón, así el escaneo automático no lo consume.
    async function prepare() {
      const codeParam = new URLSearchParams(window.location.search).get('code');
      if (codeParam) {
        setCode(codeParam);
        setStatus('has_code');
        return;
      }

      const { data } = await supabase!.auth.getSession();
      setStatus(data.session ? 'ready' : 'invalid');
    }

    prepare();
  }, [supabase]);

  async function handleConfirmLink() {
    if (!supabase || !code) return;
    setStatus('confirming');
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    setStatus(error ? 'invalid' : 'ready');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (!supabase) {
      setError('El login todavía no está conectado. Configura Supabase (ver SETUP.md).');
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
        <p className="mt-3 text-sm text-vivi-muted">Ya puedes iniciar sesión con tu nueva contraseña.</p>
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
        <p className="text-sm text-vivi-muted">Comprobando tu enlace…</p>
      </section>
    );
  }

  if (status === 'has_code' || status === 'confirming') {
    return (
      <section className="mx-auto max-w-md px-6 py-20 text-center">
        <p className="text-xs font-bold uppercase tracking-wide text-vivi-mint">Recuperar acceso</p>
        <h1 className="mt-2 text-2xl font-extrabold text-vivi-ink">Confirma que eres tú</h1>
        <p className="mt-3 text-sm text-vivi-muted">
          Por seguridad, toca el botón para continuar y elegir tu contraseña nueva.
        </p>
        <button
          type="button"
          disabled={status === 'confirming'}
          onClick={handleConfirmLink}
          className="mt-8 rounded-xl bg-vivi-navy px-6 py-3 text-sm font-bold text-white hover:bg-vivi-navyLight disabled:opacity-60"
        >
          {status === 'confirming' ? 'Comprobando…' : 'Continuar'}
        </button>
      </section>
    );
  }

  if (status === 'invalid') {
    return (
      <section className="mx-auto max-w-md px-6 py-20 text-center">
        <p className="text-xs font-bold uppercase tracking-wide text-vivi-mint">Recuperar acceso</p>
        <h1 className="mt-2 text-2xl font-extrabold text-vivi-ink">Enlace no válido</h1>
        <p className="mt-3 text-sm text-vivi-muted">{INVALID_LINK_MESSAGE}</p>
        <Link
          href="/forgot-password"
          className="mt-8 inline-block rounded-xl bg-vivi-navy px-6 py-3 text-sm font-bold text-white hover:bg-vivi-navyLight"
        >
          Pedir un enlace nuevo
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-md px-6 py-20">
      <p className="text-xs font-bold uppercase tracking-wide text-vivi-mint">Recuperar acceso</p>
      <h1 className="mt-2 text-3xl font-extrabold text-vivi-ink">Elige una contraseña nueva</h1>

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
