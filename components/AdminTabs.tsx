import Link from 'next/link';

const tabs = [
  { href: '/admin', label: 'Resumen' },
  { href: '/admin/propiedades', label: 'Propiedades' },
  { href: '/admin/integraciones', label: 'Integraciones' },
];

export default function AdminTabs({ active }: { active: string }) {
  return (
    <div className="mb-8 flex gap-2 border-b border-slate-200">
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
