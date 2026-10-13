'use client';

import { useEffect, useState } from 'react';

type Settings = {
  stripeConfigured: boolean;
  stripeKeyMasked: string | null;
  emailConfigured: boolean;
  resendApiKeyMasked: string | null;
  emailFrom: string;
};

export default function IntegrationsForm() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [stripeSecretKey, setStripeSecretKey] = useState('');
  const [resendApiKey, setResendApiKey] = useState('');
  const [emailFrom, setEmailFrom] = useState('');
  const [saving, setSaving] = useState<'stripe' | 'email' | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function load() {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((data: Settings) => {
        setSettings(data);
        setEmailFrom(data.emailFrom);
      });
  }

  useEffect(load, []);

  async function saveStripe(e: React.FormEvent) {
    e.preventDefault();
    setSaving('stripe');
    setMessage(null);
    await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stripeSecretKey }),
    });
    setStripeSecretKey('');
    setSaving(null);
    setMessage('Clave de Stripe guardada.');
    load();
  }

  async function saveEmail(e: React.FormEvent) {
    e.preventDefault();
    setSaving('email');
    setMessage(null);
    await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resendApiKey, emailFrom }),
    });
    setResendApiKey('');
    setSaving(null);
    setMessage('Configuración de email guardada.');
    load();
  }

  const inputClass = 'mt-1.5 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm';
  const labelClass = 'block text-xs font-semibold uppercase tracking-wide text-vivi-muted';

  if (!settings) return <p className="text-sm text-vivi-muted">Cargando…</p>;

  return (
    <div className="space-y-8">
      {message && (
        <p className="rounded-lg bg-vivi-mintLight px-4 py-2.5 text-sm font-medium text-vivi-mint">
          {message}
        </p>
      )}

      <form onSubmit={saveStripe} className="rounded-2xl border border-stone-200 bg-vivi-card p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-vivi-ink">Stripe</h2>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-bold ${
              settings.stripeConfigured ? 'bg-vivi-mintLight text-vivi-mint' : 'bg-stone-100 text-vivi-muted'
            }`}
          >
            {settings.stripeConfigured ? 'Conectado' : 'Sin conectar'}
          </span>
        </div>
        <p className="mt-2 text-sm text-vivi-muted">
          Cobra la fianza al reservar. Saca tu clave en Stripe → Developers → API keys.
        </p>
        {settings.stripeKeyMasked && (
          <p className="mt-2 text-xs text-vivi-muted">Clave actual: {settings.stripeKeyMasked}</p>
        )}
        <label className={`${labelClass} mt-4`}>Secret key</label>
        <input
          type="password"
          placeholder="sk_test_..."
          value={stripeSecretKey}
          onChange={(e) => setStripeSecretKey(e.target.value)}
          className={inputClass}
        />
        <button
          type="submit"
          disabled={saving === 'stripe' || !stripeSecretKey}
          className="mt-4 rounded-xl bg-vivi-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-vivi-navyLight disabled:opacity-50"
        >
          {saving === 'stripe' ? 'Guardando…' : 'Guardar clave de Stripe'}
        </button>
      </form>

      <form onSubmit={saveEmail} className="rounded-2xl border border-stone-200 bg-vivi-card p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-vivi-ink">Email (Resend)</h2>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-bold ${
              settings.emailConfigured ? 'bg-vivi-mintLight text-vivi-mint' : 'bg-stone-100 text-vivi-muted'
            }`}
          >
            {settings.emailConfigured ? 'Conectado' : 'Sin conectar'}
          </span>
        </div>
        <p className="mt-2 text-sm text-vivi-muted">
          Manda el email de &ldquo;aprobado&rdquo; y el de &ldquo;necesitamos más información&rdquo;
          cuando revisas una solicitud en /admin/solicitudes. Crea una cuenta gratis en{' '}
          <a href="https://resend.com" target="_blank" rel="noreferrer" className="underline">
            resend.com
          </a>{' '}
          y saca tu API key.
        </p>
        {settings.resendApiKeyMasked && (
          <p className="mt-2 text-xs text-vivi-muted">API key actual: {settings.resendApiKeyMasked}</p>
        )}
        <label className={`${labelClass} mt-4`}>API key</label>
        <input
          type="password"
          placeholder="re_..."
          value={resendApiKey}
          onChange={(e) => setResendApiKey(e.target.value)}
          className={inputClass}
        />
        <label className={`${labelClass} mt-4`}>Remitente</label>
        <input
          placeholder="Kasia <hola@tudominio.com>"
          value={emailFrom}
          onChange={(e) => setEmailFrom(e.target.value)}
          className={inputClass}
        />
        <p className="mt-1.5 text-xs text-vivi-muted">
          Tiene que ser un dominio que hayas verificado en Resend.
        </p>
        <button
          type="submit"
          disabled={saving === 'email' || (!resendApiKey && !emailFrom)}
          className="mt-4 rounded-xl bg-vivi-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-vivi-navyLight disabled:opacity-50"
        >
          {saving === 'email' ? 'Guardando…' : 'Guardar configuración de email'}
        </button>
      </form>
    </div>
  );
}
