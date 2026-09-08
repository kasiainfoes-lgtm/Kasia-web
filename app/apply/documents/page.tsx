import { getApplicationById } from '@/lib/applications.server';
import DocumentsUploadForm from '@/components/DocumentsUploadForm';

export const dynamic = 'force-dynamic';

export default async function ApplyDocumentsPage({
  searchParams,
}: {
  searchParams: { app?: string };
}) {
  const appId = searchParams.app;
  const application = appId ? await getApplicationById(appId) : null;

  if (!application) {
    return (
      <section className="mx-auto max-w-md px-6 py-24 text-center">
        <h1 className="text-2xl font-extrabold text-vivi-ink">Enlace inválido</h1>
        <p className="mt-3 text-sm text-vivi-muted">
          Este enlace no es válido. Si necesitás ayuda, respondé al email que te enviamos.
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-md px-6 py-20">
      <p className="text-xs font-bold uppercase tracking-wide text-vivi-mint">Tu solicitud</p>
      <h1 className="mt-2 text-2xl font-extrabold text-vivi-ink">Hola {application.name}</h1>
      <p className="mt-3 text-sm text-vivi-muted">
        Para continuar con tu solicitud necesitamos que nos envíes estos dos documentos.
      </p>
      <DocumentsUploadForm applicationId={application.id} />
    </section>
  );
}
