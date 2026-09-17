'use client';

import dynamic from 'next/dynamic';
import type { Room } from '@/lib/rooms';

// Mismo motivo que RoomLocationMap.tsx: react-leaflet no puede renderizarse
// en el servidor, y la página del asesor es un Server Component que no puede
// pasar ssr:false directamente.
const RoomsMap = dynamic(() => import('@/components/RoomsMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[600px] items-center justify-center rounded-xl border border-slate-200 bg-vivi-bg text-sm text-vivi-muted">
      Cargando mapa…
    </div>
  ),
});

export default function AdvisorRoomsMap({ rooms }: { rooms: Room[] }) {
  return <RoomsMap rooms={rooms} />;
}
