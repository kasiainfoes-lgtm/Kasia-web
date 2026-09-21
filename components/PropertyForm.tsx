'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { isVideoUrl, type Room } from '@/lib/rooms';

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
  const [acceptsSmokers, setAcceptsSmokers] = useState(initial?.acceptsSmokers ?? true);
  const [acceptsPets, setAcceptsPets] = useState(initial?.acceptsPets ?? true);
  const [acceptsDogs, setAcceptsDogs] = useState(initial?.acceptsDogs ?? false);
  const [lat, setLat] = useState(initial?.lat != null ? String(initial.lat) : '');
  const [lng, setLng] = useState(initial?.lng != null ? String(initial.lng) : '');
  const [mapsLink, setMapsLink] = useState('');
  const [resolvingLink, setResolvingLink] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [linkOk, setLinkOk] = useState(false);
  const [photos, setPhotos] = useState(initial?.photos ?? 5);
  const [photoUrls, setPhotoUrls] = useState<string[]>(initial?.photoUrls ?? []);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
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

  async function handlePhotoUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploadingPhotos(true);
    setPhotoError(null);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch('/api/admin/properties/photos', { method: 'POST', body: fd });
        if (!res.ok) {
          // 413 nunca llega a nuestro código: lo devuelve nginx/el proxy antes de
          // que Next.js reciba la petición, así que la respuesta no es JSON y el
          // mensaje real ("No pudimos subir el archivo") jamás se mostraría.
          if (res.status === 413) {
            throw new Error(
              `"${file.name}" es demasiado grande para el servidor (más allá del límite de la app, hay un límite del servidor web). Avisale a soporte para subir ese límite.`
            );
          }
          const body = await res.json().catch(() => null);
          throw new Error(body?.error ? `"${file.name}": ${body.error}` : `"${file.name}": error ${res.status}.`);
        }
        const data = await res.json();
        uploaded.push(data.url);
      }
      setPhotoUrls((urls) => [...urls, ...uploaded]);
    } catch (err) {
      setPhotoError(err instanceof Error && err.message ? err.message : 'No pudimos subir alguno de los archivos. Probá de nuevo.');
    }
    setUploadingPhotos(false);
  }

  function removePhoto(url: string) {
    setPhotoUrls((urls) => urls.filter((u) => u !== url));
  }

  async function handleResolveMapsLink() {
    if (!mapsLink.trim()) return;
    setResolvingLink(true);
    setLinkError(null);
    setLinkOk(false);
    try {
      const res = await fetch('/api/admin/properties/resolve-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: mapsLink.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No pudimos leer ese link.');
      setLat(String(data.lat));
      setLng(String(data.lng));
      setLinkOk(true);
    } catch (err) {
      setLinkError(err instanceof Error ? err.message : 'No pudimos leer ese link.');
    }
    setResolvingLink(false);
  }

  function handleAcceptsPetsChange(checked: boolean) {
    setAcceptsPets(checked);
    if (!checked) setAcceptsDogs(false);
  }

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
      acceptsSmokers,
      acceptsPets,
      acceptsDogs,
      lat: lat.trim() ? Number(lat) : null,
      lng: lng.trim() ? Number(lng) : null,
      photos: Number(photos),
      photoUrls,
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

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <label className={labelClass}>Ubicación: pegá el link de Google Maps (recomendado)</label>
        <p className="mt-1 text-xs text-vivi-muted">
          En Google Maps, buscá la dirección, tocá &quot;Compartir&quot; y copiá el link. Es más preciso
          que cargar latitud/longitud a mano.
        </p>
        <div className="mt-2 flex gap-2">
          <input
            value={mapsLink}
            onChange={(e) => {
              setMapsLink(e.target.value);
              setLinkOk(false);
              setLinkError(null);
            }}
            placeholder="https://maps.app.goo.gl/..."
            className={`${inputClass} mt-0 flex-1`}
          />
          <button
            type="button"
            disabled={resolvingLink || !mapsLink.trim()}
            onClick={handleResolveMapsLink}
            className="shrink-0 rounded-lg bg-vivi-navy px-4 text-sm font-semibold text-white disabled:opacity-50"
          >
            {resolvingLink ? 'Buscando…' : 'Usar este link'}
          </button>
        </div>
        {linkError && <p className="mt-1.5 text-xs text-red-600">{linkError}</p>}
        {linkOk && <p className="mt-1.5 text-xs font-semibold text-red-700">✓ Ubicación cargada abajo.</p>}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Latitud (opcional)</label>
          <input
            type="number"
            step="any"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            placeholder="ej: 39.4622"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Longitud (opcional)</label>
          <input
            type="number"
            step="any"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            placeholder="ej: -0.3760"
            className={inputClass}
          />
          <p className="mt-1.5 text-xs text-vivi-muted">
            Se completan solas al usar el link de arriba. Si las dejás vacías, en el mapa aparece
            el centro del barrio (zona).
          </p>
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
          <p className="mt-1.5 text-xs text-vivi-muted">Solo referencia, no hace falta que coincida.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <label className="flex items-center gap-2 text-sm font-medium text-vivi-navy">
          <input
            type="checkbox"
            checked={acceptsSmokers}
            onChange={(e) => setAcceptsSmokers(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300"
          />
          Acepta fumadores
        </label>
        <label className="flex items-center gap-2 text-sm font-medium text-vivi-navy">
          <input
            type="checkbox"
            checked={acceptsPets}
            onChange={(e) => handleAcceptsPetsChange(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300"
          />
          Acepta mascotas
        </label>
        {acceptsPets && (
          <label className="flex items-center gap-2 text-sm font-medium text-vivi-navy">
            <input
              type="checkbox"
              checked={acceptsDogs}
              onChange={(e) => setAcceptsDogs(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            Acepta perros
          </label>
        )}
      </div>

      <div>
        <label className={labelClass}>Fotos y videos de la habitación</label>
        {photoUrls.length > 0 && (
          <div className="mt-2 grid grid-cols-3 gap-3 sm:grid-cols-4">
            {photoUrls.map((url) => (
              <div key={url} className="group relative h-24 overflow-hidden rounded-lg border border-slate-200">
                {isVideoUrl(url) ? (
                  <video src={url} muted playsInline controls className="h-full w-full object-cover" />
                ) : (
                  <Image src={url} alt="" fill sizes="200px" className="object-cover" />
                )}
                <button
                  type="button"
                  onClick={() => removePhoto(url)}
                  className="absolute right-1 top-1 rounded-full bg-vivi-navy/70 px-1.5 py-0.5 text-xs font-bold text-white opacity-0 transition group-hover:opacity-100"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
        <input
          type="file"
          multiple
          accept="image/png,image/jpeg,image/webp,video/mp4,video/quicktime,video/webm"
          disabled={uploadingPhotos}
          onChange={(e) => handlePhotoUpload(e.target.files)}
          className="mt-3 block w-full text-xs text-vivi-muted file:mr-3 file:rounded-lg file:border-0 file:bg-vivi-navy file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white"
        />
        <p className="mt-1.5 text-xs text-vivi-muted">Fotos hasta 8 MB, videos hasta 50 MB.</p>
        {uploadingPhotos && <p className="mt-1.5 text-xs text-vivi-muted">Subiendo…</p>}
        {photoError && <p className="mt-1.5 text-xs text-red-600">{photoError}</p>}
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
      <p className="-mt-3 text-xs text-vivi-muted">
        Vista previa del degradé de respaldo. Solo se usa si esta habitación no tiene fotos reales
        cargadas arriba — no reemplaza a las fotos.
      </p>

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
