'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { roomCoordinates, type Room } from '@/lib/rooms';

// Leaflet puro, sin react-leaflet: el mapa se crea UNA sola vez, de forma
// imperativa, dentro de un <div> vacío que React renderiza y nunca vuelve a
// tocar. react-leaflet en cambio renderiza los tiles y marcadores COMO
// componentes de React, y sus mutaciones asincrónicas del DOM (los tiles
// cargan de a poco) terminaban chocando con lo que React esperaba encontrar
// ahí — eso disparaba los errores de hidratación (#418/#423/#425) que
// dejaban toda la página sin responder. Acá React no vuelve a mirar adentro
// de este <div> después del primer render, así que no hay nada que pueda
// no coincidir.
function priceIcon(price: number): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `
      <div style="transform:translate(-50%,-100%);display:flex;flex-direction:column;align-items:center;">
        <div style="background:#19180F;color:#fff;font-weight:700;font-size:11px;padding:3px 8px;border-radius:6px;white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,0.3);">${price} €</div>
        <div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:7px solid #19180F;"></div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export default function PropertiesMap({ rooms, height = 500 }: { rooms: Room[]; height?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || rooms.length === 0) return;

    const map = L.map(containerRef.current, { scrollWheelZoom: true });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    const points: L.LatLngExpression[] = [];
    for (const room of rooms) {
      const { lat, lng } = roomCoordinates(room);
      points.push([lat, lng]);

      const thumb = room.photoUrls[0]
        ? `<img src="${room.photoUrls[0]}" alt="" style="width:100%;height:90px;object-fit:cover;border-radius:8px;" />`
        : `<div style="width:100%;height:90px;border-radius:8px;background:#E5E2DA;"></div>`;

      const popupHtml = `
        <div style="width:180px;font-family:inherit;">
          ${thumb}
          <p style="margin:6px 0 0;font-weight:700;font-size:13px;color:#19180F;">${escapeHtml(room.title)}</p>
          <p style="margin:2px 0;font-size:12px;color:#726F65;">${escapeHtml(room.zone)}</p>
          <p style="margin:2px 0;font-size:13px;font-weight:600;color:#19180F;">${room.price} € / mes</p>
          <a href="/rooms/${encodeURIComponent(room.id)}" style="display:block;margin-top:6px;background:#15140F;color:#fff;text-align:center;padding:6px;border-radius:8px;font-size:12px;text-decoration:none;">Ver habitación</a>
        </div>
      `;

      const marker = L.marker([lat, lng], { icon: priceIcon(room.price) }).addTo(map).bindPopup(popupHtml);

      // Se ve la foto al pasar el mouse, sin tener que hacer click — pero si
      // ya la abrió con un click, queda fija (no se cierra sola al mover el
      // mouse) hasta que la cierre a propósito.
      //
      // El popup se abre justo arriba del precio y lo tapa: al abrirse, el
      // cursor queda "sobre" el popup en vez de sobre el marcador, así que
      // el mouseout del marcador se disparaba al toque y lo volvía a cerrar
      // — titilaba sin llegar a mostrarse. Por eso el cierre no es
      // inmediato: se demora un toque y se cancela si el mouse ya está
      // sobre el propio popup (el usuario lo sigue viendo igual).
      let openedByClick = false;
      let closeTimer: ReturnType<typeof setTimeout> | null = null;

      function cancelClose() {
        if (closeTimer !== null) {
          clearTimeout(closeTimer);
          closeTimer = null;
        }
      }
      function scheduleClose() {
        cancelClose();
        closeTimer = setTimeout(() => {
          if (!openedByClick) marker.closePopup();
        }, 150);
      }

      marker.on('click', () => {
        openedByClick = true;
      });
      marker.on('popupclose', () => {
        openedByClick = false;
      });
      marker.on('mouseover', () => {
        cancelClose();
        marker.openPopup();
      });
      marker.on('mouseout', scheduleClose);
      marker.on('popupopen', (e) => {
        const popupEl = e.popup.getElement();
        if (!popupEl) return;
        popupEl.addEventListener('mouseenter', cancelClose);
        popupEl.addEventListener('mouseleave', scheduleClose);
      });
    }

    if (points.length === 1) {
      map.setView(points[0], 15);
    } else {
      map.fitBounds(L.latLngBounds(points), { padding: [50, 50], maxZoom: 15 });
    }

    // Sin este cleanup, Leaflet deja el <div> marcado como "ya inicializado"
    // — si el componente se vuelve a montar (cambiar de filtro, volver con
    // el botón atrás) tira "Map container is already initialized".
    return () => {
      map.remove();
    };
  }, [rooms]);

  if (rooms.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-stone-300 p-10 text-center text-sm text-vivi-muted">
        No hay habitaciones para mostrar en el mapa.
      </p>
    );
  }

  return (
    <div
      ref={containerRef}
      // position+zIndex explícitos: los controles internos de Leaflet
      // (el +/- de zoom) tienen su propio z-index alto y sin esto quedaban
      // flotando por encima del menú fijo del sitio al hacer scroll.
      style={{ height, width: '100%', borderRadius: '1rem', position: 'relative', zIndex: 0 }}
    />
  );
}
