export type PropertyInput = {
  id: string;
  zone: string;
  title: string;
  price: number;
  match: number;
  available: string;
  individualOrPareja: 'individual' | 'pareja' | 'ambos';
  workerOrStudent: 'trabajador' | 'estudiante' | 'ambos';
  photos: number;
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
    photos: input.photos,
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
