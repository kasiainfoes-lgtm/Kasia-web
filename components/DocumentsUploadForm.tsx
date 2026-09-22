'use client';

import { useState } from 'react';
import DocumentFileInput, { type DocumentUploadStatus } from '@/components/DocumentFileInput';

type DocumentKind = 'financial-proof' | 'unpaid-rent-insurance' | 'payslip';

export default function DocumentsUploadForm({
  applicationId,
  occupationType,
}: {
  applicationId: string;
  occupationType: 'trabajador' | 'estudiante';
}) {
  const isStudent = occupationType === 'estudiante';
  const [paths, setPaths] = useState<Record<DocumentKind, string | null>>({
    'financial-proof': null,
    'unpaid-rent-insurance': null,
    payslip: null,
  });
  const [uploadStatus, setUploadStatus] = useState<Record<DocumentKind, DocumentUploadStatus>>({
    'financial-proof': 'idle',
    'unpaid-rent-insurance': 'idle',
    payslip: 'idle',
  });
  const [submitState, setSubmitState] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(kind: DocumentKind, file: File | null) {
    if (!file) return;
    setUploadStatus((s) => ({ ...s, [kind]: 'uploading' }));
    try {
      const fd = new FormData();
      fd.append('kind', kind);
      fd.append('file', file);
      const res = await fetch('/api/apply/documents', { method: 'POST', body: fd });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPaths((p) => ({ ...p, [kind]: data.path }));
      setUploadStatus((s) => ({ ...s, [kind]: 'done' }));
    } catch {
      setUploadStatus((s) => ({ ...s, [kind]: 'error' }));
    }
  }

  const ready = isStudent
    ? paths['financial-proof'] !== null && paths['unpaid-rent-insurance'] !== null
    : paths.payslip !== null;

  async function handleSubmit() {
    if (!ready) return;
    setSubmitState('submitting');
    setError(null);
    try {
      const res = await fetch('/api/apply/documents/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          isStudent
            ? {
                applicationId,
                financialProofPath: paths['financial-proof'],
                unpaidRentInsurancePath: paths['unpaid-rent-insurance'],
              }
            : { applicationId, payslipPath: paths.payslip }
        ),
      });
      if (!res.ok) throw new Error();
      setSubmitState('done');
    } catch {
      setSubmitState('error');
      setError('No pudimos enviar los documentos. Inténtalo de nuevo en un momento.');
    }
  }

  if (submitState === 'done') {
    return (
      <p className="mt-8 rounded-xl bg-vivi-mintLight px-4 py-3 text-sm font-medium text-red-700">
        ¡Listo! Recibimos tus documentos. Te avisamos por email en cuanto los revisemos.
      </p>
    );
  }

  return (
    <div className="mt-8 space-y-5">
      {isStudent ? (
        <>
          <DocumentFileInput
            label="Comprobante de solvencia económica"
            status={uploadStatus['financial-proof']}
            onChange={(file) => handleUpload('financial-proof', file)}
          />
          <DocumentFileInput
            label="Seguro de impago"
            status={uploadStatus['unpaid-rent-insurance']}
            onChange={(file) => handleUpload('unpaid-rent-insurance', file)}
          />
        </>
      ) : (
        <DocumentFileInput
          label="Nómina"
          status={uploadStatus.payslip}
          onChange={(file) => handleUpload('payslip', file)}
        />
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="button"
        disabled={!ready || submitState === 'submitting'}
        onClick={handleSubmit}
        className="w-full rounded-xl bg-vivi-navy px-5 py-3 text-sm font-semibold text-white hover:bg-vivi-navyLight disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitState === 'submitting' ? 'Enviando…' : 'Enviar documentos'}
      </button>
    </div>
  );
}
