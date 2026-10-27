import SupportForm from '@/components/SupportForm';

export default function SoportePage() {
  return (
    <section className="mx-auto max-w-md px-6 py-20">
      <p className="text-xs font-bold uppercase tracking-wide text-vivi-mint">Soporte técnico</p>
      <h1 className="mt-2 text-2xl font-extrabold text-vivi-ink sm:text-3xl">¿En qué te podemos ayudar?</h1>
      <p className="mt-3 text-sm text-vivi-muted">
        Déjanos tu teléfono y tu email y te contactamos a la brevedad.
      </p>

      <div className="mt-8">
        <SupportForm />
      </div>
    </section>
  );
}
