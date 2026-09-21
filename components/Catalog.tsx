'use client';

import { useMemo, useState } from 'react';
import { roomCoordinates, multiLocationMapsUrl, type Room } from '@/lib/rooms';
import { getFavorites } from '@/lib/favorites';
import RoomCard from '@/components/RoomCard';

function parseDMY(s: string): Date {
  const [d, m, y] = s.split('/').map(Number);
  return new Date(y, m - 1, d);
}

export default function Catalog({ rooms }: { rooms: Room[] }) {
  const zones = Array.from(new Set(rooms.map((r) => r.zone)));

  const prices = rooms.map((r) => r.price);
  const priceMin = prices.length ? Math.min(...prices) : 0;
  const priceMax = prices.length ? Math.max(...prices) : 0;

  const [zone, setZone] = useState('Todas');
  const [maxBudget, setMaxBudget] = useState(priceMax);
  const [movein, setMovein] = useState('');
  const [pareja, setPareja] = useState(false);
  const [wantsPets, setWantsPets] = useState(false);
  const [wantsDogs, setWantsDogs] = useState(false);
  const [wantsSmokers, setWantsSmokers] = useState(false);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [showFavOnly, setShowFavOnly] = useState(false);
  const [favVersion, setFavVersion] = useState(0);

  // favVersion forces a re-read of localStorage after a heart toggle elsewhere in the grid.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const favIds = useMemo(() => new Set(getFavorites()), [favVersion]);

  const filtered = useMemo(() => {
    return rooms.filter((room) => {
      if (showFavOnly && !favIds.has(room.id)) return false;
      if (zone !== 'Todas' && room.zone !== zone) return false;
      if (room.price > maxBudget) return false;
      if (pareja && room.individualOrPareja === 'individual') return false;
      if (wantsPets && !room.acceptsPets) return false;
      if (wantsDogs && !room.acceptsDogs) return false;
      if (wantsSmokers && !room.acceptsSmokers) return false;
      if (movein && parseDMY(room.available) > new Date(movein)) return false;
      return true;
    });
  }, [rooms, zone, maxBudget, movein, pareja, wantsPets, wantsDogs, wantsSmokers, showFavOnly, favIds]);

  // Un pin por zona, no por habitación: con varias propiedades en el mismo
  // barrio, mostrar cada una como parada aparte no suma información y hace
  // más fácil pasarse del límite de paradas de Google Maps.
  const mapsUrl = useMemo(() => {
    const byZone = new Map<string, { lat: number; lng: number }>();
    for (const room of filtered) {
      if (!byZone.has(room.zone)) byZone.set(room.zone, roomCoordinates(room));
    }
    return multiLocationMapsUrl(Array.from(byZone.values()));
  }, [filtered]);

  function handleWantsPetsChange(checked: boolean) {
    setWantsPets(checked);
    if (!checked) setWantsDogs(false);
  }

  return (
    <>
      <section className="relative overflow-hidden bg-vivi-navy">
        {/* Ver comentario en app/page.tsx: tapaban el texto en móvil. */}
        <div className="absolute right-[14%] top-5 hidden h-20 w-20 rounded-full bg-vivi-mint/90 sm:block" />
        <div className="absolute bottom-5 left-[8%] hidden h-24 w-24 rounded-full bg-vivi-coral/90 sm:block" />
        <div className="relative mx-auto max-w-6xl px-6 py-10 sm:py-12">
          <span className="text-xs font-bold uppercase tracking-wide text-vivi-mint">
            Valencia · vivienda habitual · mínimo 6 meses
          </span>
          <h1 className="mt-3 max-w-xl text-2xl font-extrabold leading-tight text-white sm:text-3xl">
            Encuentra tu próxima habitación, verificada y reservable desde el móvil.
          </h1>

          <div className="mt-6 grid gap-2 rounded-2xl bg-white p-2 shadow-xl sm:grid-cols-[1fr_1fr_1.4fr_auto]">
            <div className="rounded-xl px-4 py-2.5 hover:bg-vivi-bg">
              <label className="block text-[11px] font-bold uppercase tracking-wide text-vivi-muted">
                Zona
              </label>
              <select
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                className="mt-0.5 w-full bg-transparent text-sm font-semibold text-vivi-ink focus:outline-none"
              >
                <option value="Todas">Cualquier zona</option>
                {zones.map((z) => (
                  <option key={z} value={z}>
                    {z}
                  </option>
                ))}
              </select>
            </div>
            <div className="rounded-xl px-4 py-2.5 hover:bg-vivi-bg">
              <label className="block text-[11px] font-bold uppercase tracking-wide text-vivi-muted">
                Fecha de entrada
              </label>
              <input
                type="date"
                value={movein}
                onChange={(e) => setMovein(e.target.value)}
                className="mt-0.5 w-full bg-transparent text-sm font-semibold text-vivi-ink focus:outline-none"
              />
            </div>
            <div className="rounded-xl px-4 py-2.5 hover:bg-vivi-bg">
              <label className="block text-[11px] font-bold uppercase tracking-wide text-vivi-muted">
                Presupuesto máximo · {maxBudget} €
              </label>
              <input
                type="range"
                min={priceMin}
                max={priceMax}
                step={10}
                value={maxBudget}
                onChange={(e) => setMaxBudget(Number(e.target.value))}
                className="mt-2 w-full accent-vivi-mint"
              />
            </div>
            <a
              href="#catalogo"
              className="flex items-center justify-center rounded-xl bg-vivi-mint px-6 py-2.5 text-sm font-bold text-vivi-navy hover:brightness-95"
            >
              Buscar
            </a>
          </div>

          <button
            onClick={() => setShowMoreFilters((s) => !s)}
            className="mt-3 text-sm text-slate-300 underline underline-offset-4 hover:text-white"
          >
            {showMoreFilters ? 'Ocultar filtros' : 'Más filtros'}
          </button>
          {showMoreFilters && (
            <div className="mt-3 flex flex-wrap gap-3">
              <label className="flex w-fit items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm text-white">
                <input
                  type="checkbox"
                  checked={pareja}
                  onChange={(e) => setPareja(e.target.checked)}
                  className="accent-vivi-mint"
                />
                Acepta pareja
              </label>
              <label className="flex w-fit items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm text-white">
                <input
                  type="checkbox"
                  checked={wantsPets}
                  onChange={(e) => handleWantsPetsChange(e.target.checked)}
                  className="accent-vivi-mint"
                />
                Acepta mascotas
              </label>
              {wantsPets && (
                <label className="flex w-fit items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm text-white">
                  <input
                    type="checkbox"
                    checked={wantsDogs}
                    onChange={(e) => setWantsDogs(e.target.checked)}
                    className="accent-vivi-mint"
                  />
                  Acepta perros
                </label>
              )}
              <label className="flex w-fit items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm text-white">
                <input
                  type="checkbox"
                  checked={wantsSmokers}
                  onChange={(e) => setWantsSmokers(e.target.checked)}
                  className="accent-vivi-mint"
                />
                Acepta fumadores
              </label>
            </div>
          )}
        </div>
      </section>

      <div className="sticky top-[65px] z-30 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-6 py-3">
          <button
            onClick={() => setZone('Todas')}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${
              zone === 'Todas' ? 'bg-vivi-navy text-white' : 'bg-vivi-bg text-vivi-muted hover:bg-slate-200'
            }`}
          >
            Todas
          </button>
          {zones.map((z) => (
            <button
              key={z}
              onClick={() => setZone(z)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${
                zone === z ? 'bg-vivi-navy text-white' : 'bg-vivi-bg text-vivi-muted hover:bg-slate-200'
              }`}
            >
              {z}
            </button>
          ))}
        </div>
      </div>

      <section id="catalogo" className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="text-xl font-extrabold text-vivi-ink">Habitaciones disponibles en Valencia</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-vivi-muted">
              {filtered.length} {filtered.length === 1 ? 'resultado' : 'resultados'}
            </span>
            <button
              onClick={() => setShowFavOnly((s) => !s)}
              className={`rounded-full border px-3 py-1.5 text-xs font-bold ${
                showFavOnly
                  ? 'border-vivi-mint bg-vivi-mintLight text-red-700'
                  : 'border-slate-300 text-vivi-ink hover:border-vivi-navy'
              }`}
            >
              ❤ Guardados ({favIds.size})
            </button>
            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-bold text-vivi-ink hover:border-vivi-navy"
              >
                🗺 Ver en el mapa
              </a>
            )}
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((room) => (
            <RoomCard key={room.id} room={room} onToggleFavorite={() => setFavVersion((v) => v + 1)} />
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-vivi-muted">
              No hay habitaciones que coincidan con esta búsqueda. Prueba ampliando el presupuesto o
              cambiando de zona.
            </p>
          )}
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-6xl px-6 py-20">
        <p className="text-xs font-bold uppercase tracking-wide text-vivi-mint">Preguntas frecuentes</p>
        <h2 className="mt-2 text-3xl font-extrabold text-vivi-ink sm:text-4xl">
          Solo vivienda habitual: estancia mínima de 6 meses.
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="font-bold text-vivi-ink">¿Qué pago al reservar?</p>
            <p className="mt-2 text-sm text-vivi-muted">
              Una fianza equivalente a una mensualidad, en un único pago.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="font-bold text-vivi-ink">¿Qué pasa después de reservar?</p>
            <p className="mt-2 text-sm text-vivi-muted">
              Se desbloquean el contacto con tu asesor/a, la agenda de visitas y alternativas similares dentro del mismo
              rango de precio.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="font-bold text-vivi-ink">¿Aceptan estancias cortas?</p>
            <p className="mt-2 text-sm text-vivi-muted">
              No. Todas las propiedades del catálogo son solo para vivienda habitual, con una estancia
              mínima de 6 meses.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
