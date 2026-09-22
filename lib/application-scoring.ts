import { MINIMUM_STAY_MONTHS, roomAcceptsProfile, type Room } from '@/lib/rooms';

export type ApplicationStatus = 'APPROVED' | 'REVIEW' | 'NOT_ELIGIBLE' | 'REJECTED';

export type InternalReason =
  | 'MIN_STAY_NOT_MET'
  | 'BUDGET_MISMATCH'
  | 'OCCUPANCY_MISMATCH'
  | 'PET_POLICY_MISMATCH'
  | 'SMOKING_POLICY_MISMATCH'
  | 'NO_MATCHING_INVENTORY'
  | 'NO_INVENTORY_LOADED'
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

const BUDGET_TOLERANCE_EUR = 100; // un presupuesto hasta 100€ por debajo del precio igual cuenta como match

// Reglas internas de compatibilidad. Nunca se exponen al usuario ni sus
// motivos exactos — solo el estado final (APPROVED / REVIEW / NOT_ELIGIBLE).
export function scoreApplication(answers: ApplicationAnswers, rooms: Room[]): ScoringResult {
  if (answers.stayDurationMonths < MINIMUM_STAY_MONTHS) {
    return { status: 'NOT_ELIGIBLE', internalReason: 'MIN_STAY_NOT_MET' };
  }

  if (answers.hasMinors) {
    return { status: 'NOT_ELIGIBLE', internalReason: 'OCCUPANCY_MISMATCH' };
  }

  // Catálogo vacío (todavía sin cargar, o en medio de un recambio) no es un
  // motivo para rechazar a nadie: "no elegible" además dispara el bloqueo de
  // APPLICATION_COOLDOWN_DAYS, así que quedarían fuera un mes por algo que no
  // depende de ellos. Va a revisión manual.
  if (rooms.length === 0) {
    return { status: 'REVIEW', internalReason: 'NO_INVENTORY_LOADED' };
  }

  // El presupuesto nunca descalifica una solicitud por sí solo: solo se usa
  // para decidir si hay inventario que encaje (zona/ocupación/política), sin
  // filtrar por precio. Habitaciones más baratas que el presupuesto siempre
  // cuentan como match — el "<=" nunca las excluye.
  const profileRooms = rooms.filter((room) => {
    const zoneOk = answers.zone === 'Cualquier zona' || room.zone === answers.zone;
    const occupancyOk =
      answers.occupancyType === 'pareja' ? room.individualOrPareja !== 'individual' : true;
    return zoneOk && occupancyOk && roomAcceptsProfile(room, { smoker: answers.smoker, petType: answers.petType });
  });

  if (profileRooms.length === 0) {
    return { status: 'NOT_ELIGIBLE', internalReason: 'NO_MATCHING_INVENTORY' };
  }

  // Si hay inventario para su perfil pero ninguna a su presupuesto (+100€ de
  // margen), igual queda en revisión manual en vez de rechazarse: el equipo
  // decide si ofrecerle algo de todas formas.
  const withinBudget = profileRooms.some((room) => room.price <= answers.budget + BUDGET_TOLERANCE_EUR);
  if (!withinBudget) {
    return { status: 'REVIEW', internalReason: 'BUDGET_MISMATCH' };
  }

  // Nada de lo que sigue descalifica sola una solicitud: cualquier perfil que
  // llegue hasta acá queda en revisión manual para que alguien del equipo
  // decida en /admin/solicitudes si aprobarlo o pedir más información. El
  // motivo interno solo sirve de contexto, nunca cambia el estado.
  if (answers.smoker) {
    return { status: 'REVIEW', internalReason: 'SMOKING_POLICY_MISMATCH' };
  }

  if (answers.occupationType === 'estudiante') {
    return { status: 'REVIEW', internalReason: 'DOCUMENTATION_REVIEW' };
  }

  return { status: 'REVIEW', internalReason: null };
}
