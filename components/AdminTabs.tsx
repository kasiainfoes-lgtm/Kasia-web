import Link from 'next/link';

const ADMIN_TABS = [
  { href: '/admin', label: 'Resumen' },
  { href: '/admin/solicitudes', label: 'Solicitudes' },
  { href: '/admin/propiedades', label: 'Propiedades' },
  { href: '/admin/visitas', label: 'Visitas' },
  { href: '/admin/integraciones', label: 'Integraciones' },
];

// Un propietario externo no es parte del equipo de Kasia: no debe ver
// Resumen/Solicitudes/Visitas (son datos de TODOS los clientes) ni
// Integraciones (ahí viven las claves de Stripe/Resend de Kasia). Solo sus
// propias habitaciones y su propia conexión bancaria.
const OWNER_TABS = [
  { href: '/admin/propiedades', label: 'Propiedades' },
  { href: '/admin/cobros', label: 'Cobros' },
];

export default function AdminTabs({ active, role = 'admin' }: { active: string; role?: 'admin' | 'owner' }) {
  const tabs = role === 'owner' ? OWNER_TABS : ADMIN_TABS;
  return (
    <div className="mb-8 flex gap-2 border-b border-stone-200">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`-mb-px border-b-2 px-4 py-3 text-sm font-semibold ${
            active === tab.href
              ? 'border-vivi-navy text-vivi-navy'
              : 'border-transparent text-vivi-muted hover:text-vivi-navy'
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
