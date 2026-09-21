export type PropertyInput = {
  id: string;
  zone: string;
  title: string;
  price: number;
  match: number;
  available: string;
  individualOrPareja: 'individual' | 'pareja' | 'ambos';
  workerOrStudent: 'trabajador' | 'estudiante' | 'ambos';
  acceptsSmokers: boolean;
  acceptsPets: boolean;
  acceptsDogs: boolean;
  lat: number | null;
  lng: number | null;
  photos: number;
  photoUrls: string[];
  colorFrom: string;
  colorTo: string;
  amenities: string[];
  description: string;
  manager: string;
  responseTime: string;
  managerPhone: string;
  managerEmail: string;
};

// Coordenadas fuera de rango (ej: escribir la longitud sin el "0." inicial,
// o pegar los dos números juntos en un solo campo) generaban un link a
// Google Maps directamente roto. Latitud válida: -90 a 90. Longitud: -180 a
// 180 — más allá de eso no es una coordenada real, sea cual sea el motivo.
export function validateCoordinates(lat: number | null, lng: number | null): string | null {
  if (lat !== null && (Number.isNaN(lat) || lat < -90 || lat > 90)) {
    return 'La latitud tiene que estar entre -90 y 90.';
  }
  if (lng !== null && (Number.isNaN(lng) || lng < -180 || lng > 180)) {
    return 'La longitud tiene que estar entre -180 y 180.';
  }
  return null;
}

export function toPropertyRow(input: PropertyInput) {
  return {
    id: input.id,
    zone: input.zone,
    title: input.title,
    price: input.price,
    match: input.match,
    available: input.available,
    individual_or_pareja: input.individualOrPareja,
    worker_or_student: input.workerOrStudent,
    accepts_smokers: input.acceptsSmokers,
    accepts_pets: input.acceptsPets,
    accepts_dogs: input.acceptsDogs,
    lat: input.lat,
    lng: input.lng,
    photos: input.photos,
    photo_urls: input.photoUrls,
    color_from: input.colorFrom,
    color_to: input.colorTo,
    amenities: input.amenities,
    description: input.description,
    manager: input.manager,
    response_time: input.responseTime,
    manager_phone: input.managerPhone,
    manager_email: input.managerEmail,
  };
}
