'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { isVideoUrl } from '@/lib/rooms';

// Las fotos originales pueden pesar varios MB cada una. <Image> las sirve
// redimensionadas y en formato moderno, así una galería de 5 fotos pasa de
// decenas de MB a unos pocos cientos de KB.
function Media({
  url,
  alt,
  priority,
  fit = 'cover',
}: {
  url: string;
  alt: string;
  priority?: boolean;
  fit?: 'cover' | 'contain';
}) {
  if (isVideoUrl(url)) {
    const className =
      fit === 'cover' ? 'h-full w-full object-cover' : 'max-h-[85vh] max-w-[90vw] object-contain';
    return <video src={url} controls className={className} />;
  }

  // El visor a pantalla completa necesita la foto grande, pero igual
  // optimizada: sin medidas fijas no se puede usar `fill` acá.
  if (fit === 'contain') {
    return (
      <Image
        src={url}
        alt={alt}
        width={1600}
        height={1200}
        sizes="90vw"
        priority={priority}
        className="h-auto max-h-[85vh] w-auto max-w-[90vw] object-contain"
      />
    );
  }

  return (
    <Image
      src={url}
      alt={alt}
      fill
      sizes="(max-width: 640px) 100vw, 50vw"
      priority={priority}
      className="object-cover"
    />
  );
}

export default function RoomGallery({
  media,
  title,
  colorFrom,
  colorTo,
}: {
  media: string[];
  title: string;
  colorFrom: string;
  colorTo: string;
}) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const gradient = `linear-gradient(135deg, ${colorFrom}, ${colorTo})`;
  const gradientAlt = `linear-gradient(200deg, ${colorTo}, ${colorFrom})`;

  function prev() {
    setLightboxIndex((i) => (i === null ? null : (i - 1 + media.length) % media.length));
  }
  function next() {
    setLightboxIndex((i) => (i === null ? null : (i + 1) % media.length));
  }

  function Tile({ index, className, priority }: { index: number; className: string; priority?: boolean }) {
    return (
      <button
        type="button"
        onClick={() => setLightboxIndex(index)}
        className={`${className} relative block w-full cursor-zoom-in overflow-hidden text-left`}
      >
        <Media url={media[index]} alt={title} priority={priority} />
      </button>
    );
  }

  return (
    <>
      {media.length === 0 ? (
        <div className="mt-6 grid gap-1.5 overflow-hidden rounded-2xl sm:h-96 sm:grid-cols-3 sm:grid-rows-2">
          <div className="h-56 sm:col-span-1 sm:row-span-2 sm:h-full" style={{ background: gradient }} />
          <div className="hidden h-full sm:block" style={{ background: gradientAlt }} />
          <div className="hidden h-full sm:block" style={{ background: gradient }} />
          <div className="hidden h-full sm:block" style={{ background: gradientAlt }} />
          <div className="hidden h-full sm:block" style={{ background: gradient }} />
        </div>
      ) : media.length === 1 ? (
        <div className="mt-6 h-72 overflow-hidden rounded-2xl sm:h-96">
          <Tile index={0} className="h-full" priority />
        </div>
      ) : media.length === 2 ? (
        <div className="mt-6 grid gap-1.5 overflow-hidden rounded-2xl sm:h-96 sm:grid-cols-2">
          <Tile index={0} className="h-56 sm:h-full" priority />
          <Tile index={1} className="hidden h-full sm:block" />
        </div>
      ) : media.length === 3 ? (
        <div className="mt-6 grid gap-1.5 overflow-hidden rounded-2xl sm:h-96 sm:grid-cols-2 sm:grid-rows-2">
          <Tile index={0} className="h-56 sm:col-span-1 sm:row-span-2 sm:h-full" priority />
          <Tile index={1} className="hidden h-full sm:block" />
          <Tile index={2} className="hidden h-full sm:block" />
        </div>
      ) : media.length === 4 ? (
        <div className="mt-6 grid gap-1.5 overflow-hidden rounded-2xl sm:h-96 sm:grid-cols-3 sm:grid-rows-2">
          <Tile index={0} className="h-56 sm:col-span-1 sm:row-span-2 sm:h-full" priority />
          <Tile index={1} className="hidden h-full sm:col-span-2 sm:block" />
          <Tile index={2} className="hidden h-full sm:block" />
          <Tile index={3} className="hidden h-full sm:block" />
        </div>
      ) : (
        <div className="mt-6 grid gap-1.5 overflow-hidden rounded-2xl sm:h-96 sm:grid-cols-3 sm:grid-rows-2">
          <Tile index={0} className="h-56 sm:col-span-1 sm:row-span-2 sm:h-full" priority />
          {media.slice(1, 5).map((_, i) => (
            <Tile key={i + 1} index={i + 1} className="hidden h-full sm:block" />
          ))}
        </div>
      )}

      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxIndex(null)}
            className="absolute right-4 top-4 text-white"
            aria-label="Cerrar"
          >
            <X width={28} height={28} />
          </button>
          {media.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              className="absolute left-4 text-white"
              aria-label="Anterior"
            >
              <ChevronLeft width={36} height={36} />
            </button>
          )}
          <div onClick={(e) => e.stopPropagation()}>
            <Media url={media[lightboxIndex]} alt={title} fit="contain" priority />
          </div>
          {media.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              className="absolute right-4 text-white"
              aria-label="Siguiente"
            >
              <ChevronRight width={36} height={36} />
            </button>
          )}
          {media.length > 1 && (
            <p className="absolute bottom-4 text-sm text-white">
              {lightboxIndex + 1} / {media.length}
            </p>
          )}
        </div>
      )}
    </>
  );
}
