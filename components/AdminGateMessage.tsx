export default function AdminGateMessage({
  reason,
  email,
}: {
  reason: 'unconfigured' | 'unauthorized';
  email?: string;
}) {
  return (
    <section className="mx-auto max-w-2xl px-6 py-24 text-center">
      {reason === 'unconfigured' ? (
        <p className="text-vivi-muted">Supabase todavía no está configurado (ver SETUP.md).</p>
      ) : (
        <>
          <p className="text-lg font-bold text-vivi-ink">No autorizado</p>
          <p className="mt-2 text-sm text-vivi-muted">
            {email ? `Tu cuenta (${email})` : 'Tu cuenta'} no está en la lista de administradores.
            Agregala a la variable de entorno ADMIN_EMAILS (ver SETUP.md).
          </p>
        </>
      )}
    </section>
  );
}
