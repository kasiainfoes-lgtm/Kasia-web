'use client';

import { useState } from 'react';

export default function SupportForm() {
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState(''); // señuelo anti-bots, se deja vacío
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError(null);
    const res = await fetch('/api/support', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, email, message, website }),
    });
    setSending(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? 'No pudimos enviar tu consulta. Probá de nuevo.');
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-vivi-card p-6 text-center">
        <p className="font-bold text-vivi-ink">¡Listo! Recibimos tu consulta.</p>
        <p className="mt-2 text-sm text-vivi-muted">
          Te vamos a contactar a la brevedad al teléfono o email que dejaste.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-stone-200 bg-vivi-card p-6">
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-vivi-muted">
          Teléfono
        </label>
        <input
          type="tel"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="mt-1.5 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          placeholder="+34 600 000 000"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-vivi-muted">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1.5 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          placeholder="tu@email.com"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-vivi-muted">
          Contanos en qué te podemos ayudar (opcional)
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className="mt-1.5 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
        />
      </div>

      {/* Señuelo anti-bots: oculto para una persona, pero un bot que completa
          todos los inputs del formulario lo va a rellenar igual. */}
      <input
        type="text"
        name="website"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={sending}
        className="w-full rounded-xl bg-vivi-navy px-5 py-3 text-sm font-semibold text-white hover:bg-vivi-navyLight disabled:cursor-not-allowed disabled:opacity-50"
      >
        {sending ? 'Enviando…' : 'Enviar consulta'}
      </button>
    </form>
  );
}
