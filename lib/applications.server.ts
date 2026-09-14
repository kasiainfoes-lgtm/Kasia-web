import { createAdminClient } from '@/lib/supabase/admin';
import { fetchRooms } from '@/lib/properties.server';
import { scoreApplication, type ApplicationAnswers, type ApplicationStatus, type PetType } from '@/lib/application-scoring';

export type Application = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: ApplicationStatus;
  isNew?: boolean;
};

export type ApplicationDocumentsState = {
  financialProofPath: string | null;
  unpaidRentInsurancePath: string | null;
  documentsRequestedAt: string | null;
  documentsSubmittedAt: string | null;
  documentsRejectedAt: string | null;
  documentsRejectionNote: string | null;
  documentsApprovedAt: string | null;
};

export type AdminApplication = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  zone: string;
  occupationType: 'trabajador' | 'estudiante';
  petType: PetType;
  budget: number;
  status: ApplicationStatus;
  createdAt: string;
} & ApplicationDocumentsState;

const DEFAULT_COOLDOWN_DAYS = 30;

function cooldownDays(): number {
  const raw = Number(process.env.APPLICATION_COOLDOWN_DAYS);
  return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_COOLDOWN_DAYS;
}

// Evita que alguien reenvíe el formulario una y otra vez con el mismo email
// para "tantear" las reglas: si ya hay una solicitud reciente con ese email,
// se devuelve ese mismo resultado sin volver a evaluar las respuestas nuevas.
// Ojo: antes esto también miraba el teléfono (email O teléfono), lo que
// hacía que dos solicitudes de la misma persona con distinto email (pero el
// mismo teléfono) devolvieran la solicitud vieja con su email viejo pegado,
// en vez de evaluar la nueva — confuso y directamente incorrecto.
export async function submitApplication(
  answers: ApplicationAnswers & {
    name: string;
    email: string;
    phone: string | null;
    moveInDate: string | null;
    financialProofPath: string | null;
    unpaidRentInsurancePath: string | null;
  }
): Promise<Application | null> {
  const admin = createAdminClient();
  if (!admin) return null;

  const since = new Date(Date.now() - cooldownDays() * 24 * 60 * 60 * 1000).toISOString();
  const email = answers.email.trim().toLowerCase();

  const { data: existing } = await admin
    .from('applications')
    .select('id, name, email, phone, status')
    .eq('email', email)
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (existing) {
    return {
      id: existing.id,
      name: existing.name,
      email: existing.email,
      phone: existing.phone,
      status: existing.status as ApplicationStatus,
      isNew: false,
    };
  }

  const rooms = await fetchRooms();
  const { status, internalReason } = scoreApplication(answers, rooms);

  const { data, error } = await admin
    .from('applications')
    .insert({
      name: answers.name,
      email,
      phone: answers.phone,
      zone: answers.zone,
      move_in_date: answers.moveInDate,
      occupancy_type: answers.occupancyType,
      has_minors: answers.hasMinors,
      pet_type: answers.petType,
      smoker: answers.smoker,
      occupation_type: answers.occupationType,
      budget: answers.budget,
      stay_duration_months: answers.stayDurationMonths,
      financial_proof_path: answers.financialProofPath,
      unpaid_rent_insurance_path: answers.unpaidRentInsurancePath,
      status,
      internal_reason: internalReason,
    })
    .select('id, name, email, phone, status')
    .single();

  if (error || !data) return null;
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    status: data.status as ApplicationStatus,
    isNew: true,
  };
}

export async function fetchAllApplications(): Promise<AdminApplication[]> {
  const admin = createAdminClient();
  if (!admin) return [];

  const { data, error } = await admin
    .from('applications')
    .select(
      'id, name, email, phone, zone, occupation_type, pet_type, budget, status, financial_proof_path, unpaid_rent_insurance_path, documents_requested_at, documents_submitted_at, documents_rejected_at, documents_rejection_note, documents_approved_at, created_at'
    )
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    zone: row.zone,
    occupationType: row.occupation_type,
    petType: row.pet_type,
    budget: Number(row.budget),
    status: row.status,
    financialProofPath: row.financial_proof_path,
    unpaidRentInsurancePath: row.unpaid_rent_insurance_path,
    documentsRequestedAt: row.documents_requested_at,
    documentsSubmittedAt: row.documents_submitted_at,
    documentsRejectedAt: row.documents_rejected_at,
    documentsRejectionNote: row.documents_rejection_note,
    documentsApprovedAt: row.documents_approved_at,
    createdAt: row.created_at,
  }));
}

// Trae la política de fumador/mascota que la persona ya aprobada declaró en
// /apply, para poder mostrarle en /rooms solo las habitaciones que aceptan
// su perfil. Recibe el application_id ya resuelto (ver requireApprovedAccess)
// para no repetir la consulta a `profiles`. Usa el cliente admin porque
// `applications` no tiene policy de lectura para usuarios normales.
export async function getOwnApplicationAnswers(
  applicationId: string
): Promise<{ smoker: boolean; petType: PetType } | null> {
  const admin = createAdminClient();
  if (!admin) return null;

  const { data: application } = await admin
    .from('applications')
    .select('smoker, pet_type')
    .eq('id', applicationId)
    .maybeSingle();

  if (!application) return null;

  return { smoker: application.smoker, petType: application.pet_type as PetType };
}

export async function getApplicationById(id: string): Promise<Application | null> {
  const admin = createAdminClient();
  if (!admin) return null;

  const { data, error } = await admin
    .from('applications')
    .select('id, name, email, phone, status')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    status: data.status as ApplicationStatus,
  };
}

// Para /apply/documents: además de los datos básicos, necesita saber si ya
// hay documentos pedidos/subidos/rechazados para decidir si mostrar el
// formulario de subida o un mensaje de estado.
export async function getApplicationForDocuments(
  id: string
): Promise<(Pick<Application, 'id' | 'name'> & ApplicationDocumentsState) | null> {
  const admin = createAdminClient();
  if (!admin) return null;

  const { data, error } = await admin
    .from('applications')
    .select(
      'id, name, financial_proof_path, unpaid_rent_insurance_path, documents_requested_at, documents_submitted_at, documents_rejected_at, documents_rejection_note, documents_approved_at'
    )
    .eq('id', id)
    .maybeSingle();

  if (error || !data) return null;
  return {
    id: data.id,
    name: data.name,
    financialProofPath: data.financial_proof_path,
    unpaidRentInsurancePath: data.unpaid_rent_insurance_path,
    documentsRequestedAt: data.documents_requested_at,
    documentsSubmittedAt: data.documents_submitted_at,
    documentsRejectedAt: data.documents_rejected_at,
    documentsRejectionNote: data.documents_rejection_note,
    documentsApprovedAt: data.documents_approved_at,
  };
}
