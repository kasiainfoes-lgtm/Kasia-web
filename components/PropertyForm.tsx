'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Room } from '@/lib/rooms';

function toDateInput(dmy: string): string {
  const [d, m, y] = dmy.split('/');
  if (!d || !m || !y) return '';
  return `${y}-${m}-${d}`;
}

function toDMY(dateInput: string): string {
  const [y, m, d] = dateInput.split('-');
  if (!d || !m || !y) return dateInput;
  return `${d}/${m}/${y}`;
}

export default function PropertyForm({ initial }: { initial?: Room }) {
  const router = useRouter();
  const isEdit = !!initial;

  const [id, setId] = useState(initial?.id ?? '');
  const [zone, setZone] = useState(initial?.zone ?? '');
  const [title, setTitle] = useState(initial?.title ?? '');
  const [price, setPrice] = useState(initial?.price ?? 700);
  const [match, setMatch] = useState(initial?.match ?? 90);
  const [available, setAvailable] = useState(initial ? toDateInput(initial.available) : '');
  const [individualOrPareja, setIndividualOrPareja] = useState(initial?.individualOrPareja ?? 'ambos');
  const [workerOrStudent, setWorkerOrStudent] = useState(initial?.workerOrStudent ?? 'ambos');
  const [photos, setPhotos] = useState(initial?.photos ?? 5);
  const [colorFrom, setColorFrom] = useState(initial?.colorFrom ?? '#BFD9FF');
  const [colorTo, setColorTo] = useState(initial?.colorTo ?? '#DCE9FF');
  const [amenities, setAmenities] = useState(initial?.amenities.join(', ') ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [manager, setManager] = useState(initial?.manager ?? '');
  const [responseTime, setResponseTime] = useState(initial?.responseTime ?? 'Responde en menos de 24 horas');
  const [managerPhone, setManagerPhone] = useState(initial?.managerPhone ?? '');
  const [managerEmail, setManagerEmail] = useState(initial?.managerEmail ?? '');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const body = {
      id,
      zone,
      title,
      price: Number(price),
      match: Number(match),
      available: toDMY(available),
      individualOrPareja,
      workerOrStudent,
      photos: Number(photos),
      colorFrom,
      colorTo,
      amenities: amenities
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean),
      description,
      manager,
      responseTime,
      managerPhone,
      managerEmail,
    };

    const res = await fetch(isEdit ? `/api/admin/properties/${initial!.id}` : '/api/admin/properties', {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    setSaving(false);
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'No se pudo guardar.' }));
      setError(error);
      return;
    }
    router.push('/admin/propiedades');
    router.refresh();
  }

  const inputClass = 'mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm';
  const labelClass = 'block text-xs font-semibold uppercase tracking-wide text-vivi-muted';

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Identificador único (id)</label>
          <input
            required
            disabled={isEdit}
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="ej: ruzafa-6f"
            className={`${inputClass} disabled:bg-slate-100 disabled:text-vivi-muted`}
          />
        </div>
        <div>
          <label className={labelClass}>Zona / barrio</label>
          <input required value={zone} onChange={(e) => setZone(e.target.value)} className={inputClass} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Título</label>
        <input required value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label className={labelClass}>Precio mensual (€)</label>
          <input
            required
            type="number"
            min={0}
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>% compatibilidad (match)</label>
          <input
            required
            type="number"
            min={0}
            max={100}
            value={match}
            onChange={(e) => setMatch(Number(e.target.value))}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Disponible desde</label>
          <input
            required
            type="date"
            value={available}
            onChange={(e) => setAvailable(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label className={labelClass}>Individual / pareja</label>
          <select
            value={individualOrPareja}
            onChange={(e) => setIndividualOrPareja(e.target.value as typeof individualOrPareja)}
            className={inputClass}
          >
            <option value="individual">Individual</option>
            <option value="pareja">Pareja</option>
            <option value="ambos">Ambos</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Trabajador / estudiante</label>
          <select
            value={workerOrStudent}
            onChange={(e) => setWorkerOrStudent(e.target.value as typeof workerOrStudent)}
            className={inputClass}
          >
            <option value="trabajador">Trabajador</option>
            <option value="estudiante">Estudiante</option>
            <option value="ambos">Ambos</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Cantidad de fotos</label>
          <input
            type="number"
            min={1}
            value={photos}
            onChange={(e) => setPhotos(Number(e.target.value))}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Color de imagen (desde)</label>
          <div className="mt-1.5 flex items-center gap-3">
            <input
              type="color"
              value={colorFrom}
              onChange={(e) => setColorFrom(e.target.value)}
              className="h-10 w-14 rounded-lg border border-slate-300"
            />
            <span className="text-sm text-vivi-muted">{colorFrom}</span>
          </div>
        </div>
        <div>
          <label className={labelClass}>Color de imagen (hasta)</label>
          <div className="mt-1.5 flex items-center gap-3">
            <input
              type="color"
              value={colorTo}
              onChange={(e) => setColorTo(e.target.value)}
              className="h-10 w-14 rounded-lg border border-slate-300"
            />
            <span className="text-sm text-vivi-muted">{colorTo}</span>
          </div>
        </div>
      </div>
      <div
        className="h-20 rounded-xl"
        style={{ background: `linear-gradient(135deg, ${colorFrom}, ${colorTo})` }}
      />

      <div>
        <label className={labelClass}>Comodidades (separadas por coma)</label>
        <input
          value={amenities}
          onChange={(e) => setAmenities(e.target.value)}
          placeholder="WiFi de 300Mb, Aire acondicionado, Escritorio"
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Descripción</label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label className={labelClass}>Asesor/a asignado/a</label>
          <input required value={manager} onChange={(e) => setManager(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Teléfono del asesor</label>
          <input
            required
            value={managerPhone}
            onChange={(e) => setManagerPhone(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Email del asesor</label>
          <input
            required
            type="email"
            value={managerEmail}
            onChange={(e) => setManagerEmail(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Tiempo de respuesta</label>
        <input
          value={responseTime}
          onChange={(e) => setResponseTime(e.target.value)}
          className={inputClass}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-vivi-navy px-6 py-2.5 text-sm font-semibold text-white hover:bg-vivi-navyLight disabled:opacity-60"
        >
          {saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear habitación'}
        </button>
      </div>
    </form>
  );
}
