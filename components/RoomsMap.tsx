'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { roomCoordinates, type Room } from '@/lib/rooms';

function priceIcon(price: number): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<div style="transform:translate(-50%,-50%);background:#E5484D;color:#fff;font-weight:700;font-size:12px;padding:6px 10px;border-radius:999px;box-shadow:0 2px 6px rgba(0,0,0,0.3);white-space:nowrap;border:2px solid #fff;">${price} €</div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

function FitBounds({ rooms }: { rooms: Room[] }) {
  const map = useMap();

  useEffect(() => {
    if (rooms.length === 0) return;
    const bounds = L.latLngBounds(
      rooms.map((room) => {
        const { lat, lng } = roomCoordinates(room);
        return [lat, lng] as [number, number];
      })
    );
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
  }, [rooms, map]);

  return null;
}

export default function RoomsMap({ rooms }: { rooms: Room[] }) {
  if (rooms.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-vivi-muted">
        No hay habitaciones que coincidan con esta búsqueda para mostrar en el mapa.
      </p>
    );
  }

  const first = roomCoordinates(rooms[0]);

  return (
    <MapContainer
      center={[first.lat, first.lng]}
      zoom={13}
      style={{ height: '600px', width: '100%', borderRadius: '1rem' }}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds rooms={rooms} />
      {rooms.map((room) => {
        const { lat, lng } = roomCoordinates(room);
        return (
          <Marker key={room.id} position={[lat, lng]} icon={priceIcon(room.price)}>
            <Popup>
              <div className="w-48">
                {room.photoUrls[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={room.photoUrls[0]}
                    alt={room.title}
                    className="h-24 w-full rounded-lg object-cover"
                  />
                ) : (
                  <div
                    className="h-24 w-full rounded-lg"
                    style={{ background: `linear-gradient(135deg, ${room.colorFrom}, ${room.colorTo})` }}
                  />
                )}
                <p className="mt-2 text-sm font-bold text-vivi-ink">{room.title}</p>
                <p className="text-xs text-vivi-muted">{room.zone}</p>
                <p className="mt-1 text-sm font-semibold text-vivi-ink">
                  {room.price} € <span className="font-normal text-vivi-muted">/ mes</span>
                </p>
                <Link
                  href={`/rooms/${room.id}`}
                  className="mt-2 block rounded-lg bg-vivi-navy px-3 py-1.5 text-center text-xs font-semibold text-white"
                >
                  Ver habitación
                </Link>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
