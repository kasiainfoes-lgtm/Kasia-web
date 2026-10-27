'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfileForm({
  initialFullName,
  initialCompanyName,
  initialPhone,
  initialAddress,
  isOwner,
}: {
  initialFullName: string;
  initialCompanyName: string;
  initialPhone: string;
  initialAddress: string;
  isOwner: boolean;
}) {
  const router = useRouter();
  const [fullName, setFullName] = useState(initialFullName);
  const [companyName, setCompanyName] = useState(initialCompanyName);
  const [phone, setPhone] = useState(initialPhone);
  const [address, setAddress] = useState(initialAddress);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);
    const res = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, companyName, phone, address }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? 'No pudimos guardar los cambios.');
      return;
    }
    setSaved(true);
    router.refresh();
  }

  const inputClass = 'mt-1.5 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm';
  const labelClass = 'block text-xs font-semibold uppercase tracking-wide text-vivi-muted';

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div>
        <label className={labelClass}>Nombre completo</label>
        <input value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>
          {isOwner ? 'Nombre de la empresa o gestor/a' : 'Empresa (opcional)'}
        </label>
        <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Teléfono de contacto</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={inputClass}
          placeholder="+34 600 000 000"
        />
      </div>
      <div>
        <label className={labelClass}>{isOwner ? 'Dirección de la empresa' : 'Dirección (opcional)'}</label>
        <input value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {saved && !error && <p className="text-sm text-vivi-mint">Cambios guardados.</p>}

      <button
        type="submit"
        disabled={saving}
        className="rounded-xl bg-vivi-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-vivi-navyLight disabled:opacity-50"
      >
        {saving ? 'Guardando…' : 'Guardar cambios'}
      </button>
    </form>
  );
}
