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

export type ApplicationAnswers = {
  zone: string;
  occupancyType: 'individual' | 'pareja';
  hasMinors: boolean;
  hasPet: boolean;
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
  if (answers.stayDurationMonths < MINIMUM_STAY_MONTHS) {
    return { status: 'NOT_ELIGIBLE', internalReason: 'MIN_STAY_NOT_MET' };
  }

  if (answers.hasPet) {
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

  if (answers.smoker) {
    return { status: 'REVIEW', internalReason: 'SMOKING_POLICY_MISMATCH' };
  }

  const cheapestMatchPrice = Math.min(...matchingRooms.map((r) => r.price));
  const isTightBudgetFit = answers.budget - cheapestMatchPrice < 30;
  if (isTightBudgetFit) {
    return { status: 'REVIEW', internalReason: 'DOCUMENTATION_REVIEW' };
  }

  return { status: 'APPROVED', internalReason: null };
}
