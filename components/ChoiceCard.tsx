'use client';

export default function ChoiceCard({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-xl border-2 px-4 py-3.5 text-sm font-semibold transition ${
        selected
          ? 'border-vivi-navy bg-vivi-navy text-white'
          : 'border-slate-200 text-vivi-ink hover:border-slate-300'
      }`}
    >
      {label}
    </button>
  );
}
