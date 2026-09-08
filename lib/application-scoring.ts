import { MINIMUM_STAY_MONTHS, type Room } from '@/lib/rooms';

export type ApplicationStatus = 'APPROVED' | 'REVIEW' | 'NOT_ELIGIBLE';

export type InternalReason =
  | 'MIN_STAY_NOT_MET'
  | 'BUDGET_MISMATCH'
  | 'OCCUPANCY_MISMATCH'
  | 'PET_POLICY_MISMATCH'
  | 'SMOKING_POLICY_MISMATCH'
  | 'NO_MATCHING_INVENTORY'
  | 'DOCUMENTATION_REVIEW'
  | null;

export type PetType = 'ninguno' | 'perro' | 'gato' | 'otro';

export type ApplicationAnswers = {
  zone: string;
  occupancyType: 'individual' | 'pareja';
  hasMinors: boolean;
  petType: PetType;
  smoker: boolean;
  occupationType: 'trabajador' | 'estudiante';
  budget: number;
  stayDurationMonths: number;
};

export type ScoringResult = { status: ApplicationStatus; internalReason: InternalReason };

const CHEAPEST_ROOM_FLOOR = 600; // por debajo de esto no hay inventario en ninguna zona

// Reglas internas de compatibilidad. Nunca se exponen al usuario ni sus
// motivos exactos — solo el estado final (APPROVED / REVIEW / NOT_ELIGIBLE).
export function scoreApplication(answers: ApplicationAnswers, rooms: Room[]): ScoringResult {
  // Por el momento ninguna habitación admite perros. Gatos u otras mascotas
  // sí pueden seguir el flujo normal.
  if (answers.petType === 'perro') {
    return { status: 'NOT_ELIGIBLE', internalReason: 'PET_POLICY_MISMATCH' };
  }

  if (answers.hasMinors) {
    return { status: 'NOT_ELIGIBLE', internalReason: 'OCCUPANCY_MISMATCH' };
  }

  if (answers.budget < CHEAPEST_ROOM_FLOOR) {
    return { status: 'NOT_ELIGIBLE', internalReason: 'BUDGET_MISMATCH' };
  }

  const matchingRooms = rooms.filter((room) => {
    const zoneOk = answers.zone === 'Cualquier zona' || room.zone === answers.zone;
    const occupancyOk =
      answers.occupancyType === 'pareja' ? room.individualOrPareja !== 'individual' : true;
    return zoneOk && occupancyOk && room.price <= answers.budget;
  });

  if (matchingRooms.length === 0) {
    return { status: 'NOT_ELIGIBLE', internalReason: 'NO_MATCHING_INVENTORY' };
  }

  // Nada de lo que sigue descalifica sola una solicitud: cualquier perfil que
  // llegue hasta acá queda en revisión manual para que alguien del equipo
  // decida en /admin/solicitudes si aprobarlo o pedir más información. El
  // motivo interno solo sirve de contexto, nunca cambia el estado.
  if (answers.stayDurationMonths < MINIMUM_STAY_MONTHS) {
    return { status: 'REVIEW', internalReason: 'MIN_STAY_NOT_MET' };
  }

  if (answers.smoker) {
    return { status: 'REVIEW', internalReason: 'SMOKING_POLICY_MISMATCH' };
  }

  if (answers.occupationType === 'estudiante') {
    return { status: 'REVIEW', internalReason: 'DOCUMENTATION_REVIEW' };
  }

  return { status: 'REVIEW', internalReason: null };
}
