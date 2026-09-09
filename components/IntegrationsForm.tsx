'use client';

import { useEffect, useState } from 'react';

type Settings = {
  stripeConfigured: boolean;
  stripeKeyMasked: string | null;
  diditConfigured: boolean;
  diditApiKeyMasked: string | null;
  diditWorkflowId: string;
  emailConfigured: boolean;
  resendApiKeyMasked: string | null;
  emailFrom: string;
};

export default function IntegrationsForm() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [stripeSecretKey, setStripeSecretKey] = useState('');
  const [diditApiKey, setDiditApiKey] = useState('');
  const [diditWorkflowId, setDiditWorkflowId] = useState('');
  const [resendApiKey, setResendApiKey] = useState('');
  const [emailFrom, setEmailFrom] = useState('');
  const [saving, setSaving] = useState<'stripe' | 'didit' | 'email' | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function load() {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((data: Settings) => {
        setSettings(data);
        setDiditWorkflowId(data.diditWorkflowId);
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

  async function saveDidit(e: React.FormEvent) {
    e.preventDefault();
    setSaving('didit');
    setMessage(null);
    await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ diditApiKey, diditWorkflowId }),
    });
    setDiditApiKey('');
    setSaving(null);
    setMessage('Configuración de Didit guardada.');
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

  const inputClass = 'mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm';
  const labelClass = 'block text-xs font-semibold uppercase tracking-wide text-vivi-muted';

  if (!settings) return <p className="text-sm text-vivi-muted">Cargando…</p>;

  return (
    <div className="space-y-8">
      {message && (
        <p className="rounded-lg bg-vivi-mintLight px-4 py-2.5 text-sm font-medium text-red-700">
          {message}
        </p>
      )}

      <form onSubmit={saveStripe} className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-vivi-ink">Stripe</h2>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-bold ${
              settings.stripeConfigured ? 'bg-vivi-mintLight text-red-700' : 'bg-slate-100 text-vivi-muted'
            }`}
          >
            {settings.stripeConfigured ? 'Conectado' : 'Sin conectar'}
          </span>
        </div>
        <p className="mt-2 text-sm text-vivi-muted">
          Cobra la fianza + comisión al reservar. Saca tu clave en Stripe → Developers → API keys.
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

      <form onSubmit={saveDidit} className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-vivi-ink">Didit (verificación de identidad)</h2>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-bold ${
              settings.diditConfigured ? 'bg-vivi-mintLight text-red-700' : 'bg-slate-100 text-vivi-muted'
            }`}
          >
            {settings.diditConfigured ? 'Conectado' : 'Sin conectar'}
          </span>
        </div>
        <p className="mt-2 text-sm text-vivi-muted">
          Verifica documento + selfie antes de reservar. Saca tu API key y crea un workflow en el
          panel de Didit.
        </p>
        {settings.diditApiKeyMasked && (
          <p className="mt-2 text-xs text-vivi-muted">API key actual: {settings.diditApiKeyMasked}</p>
        )}
        <label className={`${labelClass} mt-4`}>API key</label>
        <input
          type="password"
          placeholder="Pega tu API key de Didit"
          value={diditApiKey}
          onChange={(e) => setDiditApiKey(e.target.value)}
          className={inputClass}
        />
        <label className={`${labelClass} mt-4`}>ID del workflow</label>
        <input
          value={diditWorkflowId}
          onChange={(e) => setDiditWorkflowId(e.target.value)}
          className={inputClass}
        />
        <button
          type="submit"
          disabled={saving === 'didit' || (!diditApiKey && !diditWorkflowId)}
          className="mt-4 rounded-xl bg-vivi-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-vivi-navyLight disabled:opacity-50"
        >
          {saving === 'didit' ? 'Guardando…' : 'Guardar configuración de Didit'}
        </button>
      </form>

      <form onSubmit={saveEmail} className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-vivi-ink">Email (Resend)</h2>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-bold ${
              settings.emailConfigured ? 'bg-vivi-mintLight text-red-700' : 'bg-slate-100 text-vivi-muted'
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
