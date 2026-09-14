import {
  Wifi,
  WashingMachine,
  ChefHat,
  Bath,
  Snowflake,
  Laptop,
  ArrowUpDown,
  Trees,
  Flame,
  Car,
  Tv,
  DoorClosed,
  BedDouble,
  Check,
  type LucideIcon,
} from 'lucide-react';

function normalize(label: string): string {
  return label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

const RULES: { test: RegExp; icon: LucideIcon }[] = [
  { test: /wifi/, icon: Wifi },
  { test: /lavador/, icon: WashingMachine },
  { test: /cocina/, icon: ChefHat },
  { test: /bano/, icon: Bath },
  { test: /aire acondicionado|climatiza/, icon: Snowflake },
  { test: /escritorio|estudio/, icon: Laptop },
  { test: /ascensor/, icon: ArrowUpDown },
  { test: /balcon|terraza/, icon: Trees },
  { test: /calefaccion/, icon: Flame },
  { test: /parking|garaje|aparcamiento/, icon: Car },
  { test: /tv|television/, icon: Tv },
  { test: /armario|ropero/, icon: DoorClosed },
  { test: /cama|habitacion/, icon: BedDouble },
];

// Las comodidades se cargan como texto libre desde /admin/propiedades, así
// que el ícono se elige por palabras clave en vez de un catálogo cerrado —
// cualquier texto que no matchee ninguna regla cae en un check genérico.
export default function AmenityIcon({ label, className }: { label: string; className?: string }) {
  const normalized = normalize(label);
  const match = RULES.find((rule) => rule.test.test(normalized));
  const Icon = match?.icon ?? Check;
  return <Icon className={className} strokeWidth={2} aria-hidden="true" />;
}
