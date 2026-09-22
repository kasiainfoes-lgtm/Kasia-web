import { getApplicationForDocuments } from '@/lib/applications.server';
import DocumentsUploadForm from '@/components/DocumentsUploadForm';

export const dynamic = 'force-dynamic';

export default async function ApplyDocumentsPage({
  searchParams,
}: {
  searchParams: { app?: string };
}) {
  const appId = searchParams.app;
  const application = appId ? await getApplicationForDocuments(appId) : null;

  if (!application) {
    return (
      <section className="mx-auto max-w-md px-6 py-24 text-center">
        <h1 className="text-2xl font-extrabold text-vivi-ink">Enlace inválido</h1>
        <p className="mt-3 text-sm text-vivi-muted">
          Este enlace no es válido. Si necesitas ayuda, responde al email que te enviamos.
        </p>
      </section>
    );
  }

  // El formulario solo se muestra si hay algo pendiente de subir: nunca se
  // pidieron documentos todavía, o el admin rechazó los últimos y pidió
  // reenviarlos. Fuera de eso (ya enviados y esperando revisión, o ya
  // aprobados) mostramos un mensaje de estado en vez de dejar resubir.
  const needsUpload = !application.documentsApprovedAt && (!application.documentsSubmittedAt || application.documentsRejectedAt);

  return (
    <section className="mx-auto max-w-md px-6 py-20">
      <p className="text-xs font-bold uppercase tracking-wide text-vivi-mint">Tu solicitud</p>
      <h1 className="mt-2 text-2xl font-extrabold text-vivi-ink">Hola {application.name}</h1>

      {needsUpload ? (
        <>
          {application.documentsRejectedAt && application.documentsRejectionNote && (
            <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              Revisamos tus documentos y necesitamos que corrijas esto: {application.documentsRejectionNote}
            </p>
          )}
          <p className="mt-3 text-sm text-vivi-muted">
            {application.occupationType === 'estudiante'
              ? 'Para continuar con tu solicitud necesitamos que nos envíes estos dos documentos.'
              : 'Para continuar con tu solicitud necesitamos que nos envíes tu nómina.'}
          </p>
          <DocumentsUploadForm applicationId={application.id} occupationType={application.occupationType} />
        </>
      ) : application.documentsApprovedAt ? (
        <p className="mt-8 rounded-xl bg-vivi-mintLight px-4 py-3 text-sm font-medium text-red-700">
          Ya revisamos tus documentos y están todos en orden. Pronto nos pondremos en contacto contigo.
        </p>
      ) : (
        <p className="mt-8 rounded-xl bg-vivi-mintLight px-4 py-3 text-sm font-medium text-red-700">
          Ya recibimos tus documentos. Te avisamos por email en cuanto los revisemos.
        </p>
      )}
    </section>
  );
}
