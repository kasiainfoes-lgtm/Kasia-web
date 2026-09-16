'use client';

import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { roomCoordinates } from '@/lib/rooms';

function pinIcon(): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<div style="width:16px;height:16px;background:#E5484D;border:3px solid white;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,0.4);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

// Mapa de una sola habitación, embebido en su página de detalle — solo para
// ubicar el barrio, no para navegar el catálogo. scrollWheelZoom apagado a
// propósito: dentro de una página con scroll normal, el mapa no debe robarse
// la rueda del mouse.
export default function RoomMiniMap({ zone, lat, lng }: { zone: string; lat: number; lng: number }) {
  const { lat: y, lng: x } = roomCoordinates({ lat, lng, zone });

  return (
    <MapContainer
      center={[y, x]}
      zoom={15}
      // Ver comentario en RoomsMap.tsx: sin position+zIndex explícitos, los
      // controles de Leaflet quedan por encima del menú fijo al hacer scroll.
      style={{ height: '220px', width: '100%', borderRadius: '1rem', position: 'relative', zIndex: 0 }}
      scrollWheelZoom={false}
    >
      {/* Mismo cambio que RoomsMap.tsx: CartoDB empezó a pedir API key
          incluso para su estilo gratuito. */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[y, x]} icon={pinIcon()} />
    </MapContainer>
  );
}
