'use client';

import dynamic from 'next/dynamic';
import type { Room } from '@/lib/rooms';

// Leaflet toca `window` al importarse, así que no puede renderizarse en el
// servidor. Este wrapper 'use client' es lo que permite pasar ssr:false
// cuando el llamador es un Server Component (que no puede hacerlo directo).
const PropertiesMap = dynamic(() => import('@/components/PropertiesMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[500px] items-center justify-center rounded-xl border border-slate-200 bg-vivi-bg text-sm text-vivi-muted">
      Cargando mapa…
    </div>
  ),
});

export default function PropertiesMapLoader({ rooms, height }: { rooms: Room[]; height?: number }) {
  return <PropertiesMap rooms={rooms} height={height} />;
}
