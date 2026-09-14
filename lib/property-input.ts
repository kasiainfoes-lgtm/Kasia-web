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
