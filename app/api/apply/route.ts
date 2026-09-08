import { NextResponse } from 'next/server';
import { submitApplication } from '@/lib/applications.server';
import { scoreApplication, type ApplicationAnswers } from '@/lib/application-scoring';
import { fetchRooms } from '@/lib/properties.server';
import { APP_ID_COOKIE, APP_DEMO_STATUS_COOKIE, APP_COOKIE_MAX_AGE } from '@/lib/apply-session';

const REQUIRED_FIELDS = [
  'name',
  'email',
  'zone',
  'occupancyType',
  'occupationType',
  'budget',
  'stayDurationMonths',
] as const;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 400 });
  }

  for (const field of REQUIRED_FIELDS) {
    if (body[field] === undefined || body[field] === null || body[field] === '') {
      return NextResponse.json({ error: `Falta el campo ${field}.` }, { status: 400 });
    }
  }

  const answers: ApplicationAnswers = {
    zone: String(body.zone),
    occupancyType: body.occupancyType === 'pareja' ? 'pareja' : 'individual',
    hasMinors: !!body.hasMinors,
    hasPet: !!body.hasPet,
    smoker: !!body.smoker,
    occupationType: body.occupationType === 'estudiante' ? 'estudiante' : 'trabajador',
    budget: Number(body.budget),
    stayDurationMonths: Number(body.stayDurationMonths),
  };

  // Nota: el nombre viaja solo como dato identificativo. scoreApplication()
  // ni lo recibe — nunca puede influir en el resultado.
  const application = await submitApplication({
    ...answers,
    name: String(body.name).trim(),
    email: String(body.email).trim(),
    phone: body.phone ? String(body.phone).trim() : null,
    moveInDate: body.moveInDate || null,
  });

  const cookieBase = {
    httpOnly: true as const,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    maxAge: APP_COOKIE_MAX_AGE,
    path: '/',
  };

  if (application) {
    const response = NextResponse.json({ status: application.status });
    response.cookies.set(APP_ID_COOKIE, application.id, cookieBase);
    return response;
  }

  // Modo demo: Supabase no está configurado todavía, así que no hay dónde
  // persistir la solicitud. Igual calculamos un resultado real (sin
  // guardarlo) para que el flujo completo se pueda probar de punta a punta.
  const rooms = await fetchRooms();
  const { status } = scoreApplication(answers, rooms);
  const response = NextResponse.json({ status });
  response.cookies.set(APP_DEMO_STATUS_COOKIE, status, cookieBase);
  return response;
}
