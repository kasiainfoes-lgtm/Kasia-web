'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ChoiceCard from '@/components/ChoiceCard';
import DocumentFileInput, { type DocumentUploadStatus } from '@/components/DocumentFileInput';

const ZONES = [
  'Cualquier zona',
  'Ruzafa',
  'Benimaclet',
  'Mestalla',
  'El Carmen',
  'Extramurs',
  'Camins al Grau',
  'Patraix',
  'Algirós',
  'Malvarrosa',
];

const DURATIONS = [3, 6, 9, 12, 18, 24];

type PetType = 'perro' | 'gato' | 'otro' | '';
type DocumentKind = 'financial-proof' | 'unpaid-rent-insurance';

type FormState = {
  zone: string;
  moveInDate: string;
  budget: number;
  occupancyType: 'individual' | 'pareja' | '';
  hasMinors: boolean | null;
  hasPet: boolean | null;
  petType: PetType;
  occupationType: 'trabajador' | 'estudiante' | '';
  smoker: boolean | null;
  stayDurationMonths: number | '';
  name: string;
  email: string;
  phone: string;
  financialProofPath: string | null;
  unpaidRentInsurancePath: string | null;
};

const STEP_TITLES = ['Tu búsqueda', 'Cómo vas a vivir', 'Tu perfil', 'Tus datos', 'Comprobando disponibilidad'];

export default function ApplyWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<Record<DocumentKind, DocumentUploadStatus>>({
    'financial-proof': 'idle',
    'unpaid-rent-insurance': 'idle',
  });
  const [form, setForm] = useState<FormState>({
    zone: '',
    moveInDate: '',
    budget: 700,
    occupancyType: '',
    hasMinors: null,
    hasPet: null,
    petType: '',
    occupationType: '',
    smoker: null,
    stayDurationMonths: '',
    name: '',
    email: '',
    phone: '',
    financialProofPath: null,
    unpaidRentInsurancePath: null,
  });

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleDocumentUpload(kind: DocumentKind, file: File | null) {
    if (!file) return;
    setUploadStatus((s) => ({ ...s, [kind]: 'uploading' }));
    try {
      const fd = new FormData();
      fd.append('kind', kind);
      fd.append('file', file);
      const res = await fetch('/api/apply/documents', { method: 'POST', body: fd });
      if (!res.ok) throw new Error();
      const data = await res.json();
      update(kind === 'financial-proof' ? 'financialProofPath' : 'unpaidRentInsurancePath', data.path);
      setUploadStatus((s) => ({ ...s, [kind]: 'done' }));
    } catch {
      setUploadStatus((s) => ({ ...s, [kind]: 'error' }));
    }
  }

  const isStudent = form.occupationType === 'estudiante';
  const studentDocsReady =
    !isStudent || (form.financialProofPath !== null && form.unpaidRentInsurancePath !== null);

  const stepValid = [
    form.zone !== '' && form.moveInDate !== '',
    form.occupancyType !== '' &&
      form.hasMinors !== null &&
      form.hasPet !== null &&
      (form.hasPet === false || form.petType !== ''),
    form.occupationType !== '' &&
      form.smoker !== null &&
      form.stayDurationMonths !== '' &&
      studentDocsReady,
    form.name.trim() !== '' && /\S+@\S+\.\S+/.test(form.email) && form.phone.trim() !== '',
  ][step];

  async function handleSubmit() {
    setStep(4);
    setError(null);
    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, petType: form.hasPet ? form.petType : 'ninguno' }),
      });
      if (!res.ok) throw new Error();
      router.push('/apply/result');
    } catch {
      setError('No pudimos procesar tu solicitud. Inténtalo de nuevo en un momento.');
      setStep(3);
    }
  }

  const pct = Math.round(((step + 1) / 5) * 100);

  return (
    <section className="mx-auto max-w-md px-6 py-14">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-vivi-mint transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-4 text-xs font-bold uppercase tracking-wide text-vivi-mint">
        Paso {Math.min(step + 1, 5)} de 5
      </p>
      <h1 className="mt-1 text-2xl font-extrabold text-vivi-ink">{STEP_TITLES[step]}</h1>

      <div className="mt-8">
        {step === 0 && (
          <div className="space-y-6">
            <Field label="Zona">
              <select
                value={form.zone}
                onChange={(e) => update('zone', e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
              >
                <option value="" disabled>
                  Elige una zona
                </option>
                {ZONES.map((z) => (
                  <option key={z} value={z}>
                    {z}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Fecha de entrada">
              <input
                type="date"
                value={form.moveInDate}
                onChange={(e) => update('moveInDate', e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
              />
            </Field>
            <Field label={`Presupuesto mensual · ${form.budget} €`}>
              <input
                type="range"
                min={400}
                max={1200}
                step={10}
                value={form.budget}
                onChange={(e) => update('budget', Number(e.target.value))}
                className="w-full accent-vivi-mint"
              />
            </Field>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <Field label="¿Uso individual o de pareja?">
              <div className="flex gap-3">
                <ChoiceCard
                  label="Individual"
                  selected={form.occupancyType === 'individual'}
                  onClick={() => update('occupancyType', 'individual')}
                />
                <ChoiceCard
                  label="Pareja"
                  selected={form.occupancyType === 'pareja'}
                  onClick={() => update('occupancyType', 'pareja')}
                />
              </div>
            </Field>
            <Field label="¿Hay menores de edad?">
              <YesNo value={form.hasMinors} onChange={(v) => update('hasMinors', v)} />
            </Field>
            <Field label="¿Tienes mascota?">
              <YesNo
                value={form.hasPet}
                onChange={(v) => {
                  update('hasPet', v);
                  if (!v) update('petType', '');
                }}
              />
            </Field>
            {form.hasPet === true && (
              <Field label="¿Qué tipo de mascota?">
                <div className="flex gap-3">
                  <ChoiceCard
                    label="Perro"
                    selected={form.petType === 'perro'}
                    onClick={() => update('petType', 'perro')}
                  />
                  <ChoiceCard
                    label="Gato"
                    selected={form.petType === 'gato'}
                    onClick={() => update('petType', 'gato')}
                  />
                  <ChoiceCard
                    label="Otro"
                    selected={form.petType === 'otro'}
                    onClick={() => update('petType', 'otro')}
                  />
                </div>
              </Field>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <Field label="¿Eres trabajador/a o estudiante?">
              <div className="flex gap-3">
                <ChoiceCard
                  label="Trabajador/a"
                  selected={form.occupationType === 'trabajador'}
                  onClick={() => update('occupationType', 'trabajador')}
                />
                <ChoiceCard
                  label="Estudiante"
                  selected={form.occupationType === 'estudiante'}
                  onClick={() => update('occupationType', 'estudiante')}
                />
              </div>
            </Field>
            {isStudent && (
              <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs leading-relaxed text-vivi-muted">
                  Como estudiante necesitamos dos documentos para revisar tu solicitud.
                </p>
                <DocumentFileInput
                  label="Comprobante de solvencia económica"
                  status={uploadStatus['financial-proof']}
                  onChange={(file) => handleDocumentUpload('financial-proof', file)}
                />
                <DocumentFileInput
                  label="Seguro de impago"
                  status={uploadStatus['unpaid-rent-insurance']}
                  onChange={(file) => handleDocumentUpload('unpaid-rent-insurance', file)}
                />
              </div>
            )}
            <Field label="¿Fumas?">
              <YesNo value={form.smoker} onChange={(v) => update('smoker', v)} />
            </Field>
            <Field label="¿Durante cuánto tiempo quieres alquilar?">
              <div className="flex flex-wrap gap-2">
                {DURATIONS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => update('stayDurationMonths', m)}
                    className={`rounded-full border-2 px-4 py-2 text-sm font-semibold ${
                      form.stayDurationMonths === m
                        ? 'border-vivi-navy bg-vivi-navy text-white'
                        : 'border-slate-200 text-vivi-ink hover:border-slate-300'
                    }`}
                  >
                    {m} meses
                  </button>
                ))}
              </div>
            </Field>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <Field label="Nombre">
              <input
                type="text"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
              />
            </Field>
            <Field label="Teléfono">
              <input
                type="tel"
                required
                placeholder="+34 600 000 000"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
              />
              <p className="mt-1.5 text-xs text-vivi-muted">Incluye el prefijo del país (ej: +34).</p>
            </Field>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col items-center gap-4 py-10 text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-vivi-mint" />
            <p className="text-sm text-vivi-muted">
              Estamos comprobando tu compatibilidad con las habitaciones disponibles…
            </p>
          </div>
        )}
      </div>

      {step < 4 && (
        <div className="mt-8 flex gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-vivi-ink"
            >
              Atrás
            </button>
          )}
          <button
            disabled={!stepValid}
            onClick={() => (step === 3 ? handleSubmit() : setStep((s) => s + 1))}
            className="flex-1 rounded-xl bg-vivi-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-vivi-navyLight disabled:cursor-not-allowed disabled:opacity-50"
          >
            {step === 3 ? 'Comprobar disponibilidad' : 'Continuar'}
          </button>
        </div>
      )}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-vivi-muted">
        {label}
      </label>
      {children}
    </div>
  );
}

function YesNo({ value, onChange }: { value: boolean | null; onChange: (v: boolean) => void }) {
  return (
    <div className="flex gap-3">
      <ChoiceCard label="Sí" selected={value === true} onClick={() => onChange(true)} />
      <ChoiceCard label="No" selected={value === false} onClick={() => onChange(false)} />
    </div>
  );
}
