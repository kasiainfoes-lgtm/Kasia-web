import { createAdminClient } from '@/lib/supabase/admin';
import { fetchRooms } from '@/lib/properties.server';
import { scoreApplication, type ApplicationAnswers, type ApplicationStatus, type PetType } from '@/lib/application-scoring';

export type Application = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: ApplicationStatus;
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
  financialProofPath: string | null;
  unpaidRentInsurancePath: string | null;
  documentsRequestedAt: string | null;
  documentsSubmittedAt: string | null;
  createdAt: string;
};

const DEFAULT_COOLDOWN_DAYS = 30;

function cooldownDays(): number {
  const raw = Number(process.env.APPLICATION_COOLDOWN_DAYS);
  return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_COOLDOWN_DAYS;
}

// Evita que alguien reenvíe el formulario una y otra vez para "tantear" las
// reglas: si ya hay una solicitud reciente con el mismo email o teléfono,
// se devuelve ese mismo resultado sin volver a evaluar las respuestas nuevas.
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

  let existingQuery = admin
    .from('applications')
    .select('id, name, email, phone, status')
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(1);

  existingQuery = answers.phone
    ? existingQuery.or(`email.eq.${email},phone.eq.${answers.phone}`)
    : existingQuery.eq('email', email);

  const { data: existing } = await existingQuery.maybeSingle();
  if (existing) {
    return {
      id: existing.id,
      name: existing.name,
      email: existing.email,
      phone: existing.phone,
      status: existing.status as ApplicationStatus,
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
  };
}

export async function fetchAllApplications(): Promise<AdminApplication[]> {
  const admin = createAdminClient();
  if (!admin) return [];

  const { data, error } = await admin
    .from('applications')
    .select(
      'id, name, email, phone, zone, occupation_type, pet_type, budget, status, financial_proof_path, unpaid_rent_insurance_path, documents_requested_at, documents_submitted_at, created_at'
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
    createdAt: row.created_at,
  }));
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
