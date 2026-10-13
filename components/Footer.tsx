export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-black text-slate-300">
      <div className="mx-auto max-w-6xl px-6 py-4 text-sm">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-semibold text-white">Kasia · Valencia</p>
          <p className="text-xs text-slate-500">© {new Date().getFullYear()} Kasia Inmobiliaria</p>
        </div>
      </div>
    </footer>
  );
}
