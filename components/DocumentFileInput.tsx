'use client';

export type DocumentUploadStatus = 'idle' | 'uploading' | 'done' | 'error';

export default function DocumentFileInput({
  label,
  status,
  onChange,
}: {
  label: string;
  status: DocumentUploadStatus;
  onChange: (file: File | null) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-vivi-ink">{label}</label>
      <input
        type="file"
        accept="application/pdf,image/png,image/jpeg"
        disabled={status === 'uploading'}
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        className="block w-full text-xs text-vivi-muted file:mr-3 file:rounded-lg file:border-0 file:bg-vivi-navy file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white"
      />
      {status === 'uploading' && <p className="mt-1 text-xs text-vivi-muted">Subiendo…</p>}
      {status === 'done' && <p className="mt-1 text-xs font-semibold text-red-600">Subido ✓</p>}
      {status === 'error' && (
        <p className="mt-1 text-xs text-red-600">No pudimos subir el archivo. Inténtalo de nuevo.</p>
      )}
    </div>
  );
}
