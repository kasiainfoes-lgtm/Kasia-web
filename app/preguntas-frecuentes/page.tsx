import FaqContent from '@/components/FaqContent';

export default function FaqPage() {
  return (
    <section className="bg-vivi-bg py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-wide text-vivi-mint">Preguntas frecuentes</p>
          <h1 className="mt-2 text-3xl font-extrabold text-vivi-ink sm:text-4xl">
            Solo vivienda habitual: estancia mínima de 6 meses.
          </h1>
        </div>
        <FaqContent />
      </div>
    </section>
  );
}
