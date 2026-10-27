import Link from 'next/link';
import OwnerSignupForm from '@/components/OwnerSignupForm';

export default function OwnerSignupPage() {
  return (
    <section className="mx-auto max-w-md px-6 py-20">
      <p className="text-xs font-bold uppercase tracking-wide text-vivi-mint">Propietarios</p>
      <h1 className="mt-2 text-2xl font-extrabold text-vivi-ink sm:text-3xl">
        Publicá tu propiedad en Kasia
      </h1>
      <p className="mt-3 text-sm text-vivi-muted">
        Creá tu cuenta, cargá tus habitaciones y conectá tu cuenta bancaria — cuando alguien
        reserve, la fianza llega directo a vos (menos la comisión de Kasia).
      </p>

      <OwnerSignupForm />

      <p className="mt-6 text-center text-sm text-vivi-muted">
        ¿Ya tenés cuenta?{' '}
        <Link href="/login" className="font-semibold text-vivi-navy hover:underline">
          Iniciar sesión
        </Link>
      </p>
    </section>
  );
}
