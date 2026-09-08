export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-vivi-navy text-slate-300">
      <div className="mx-auto max-w-6xl px-6 py-10 text-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-semibold text-white">Kasia · Valencia</p>
          <p>Alquiler residencial, verificado y reservable desde el móvil.</p>
        </div>
        <p className="mt-4 text-xs text-slate-500">
          Vivienda habitual · estancia mínima 6 meses. Fianza equivalente a una mensualidad + comisión
          fija de servicio de 50 €.
        </p>
      </div>
    </footer>
  );
}
