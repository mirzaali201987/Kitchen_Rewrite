// source_handbook: week11-hackathon-preparation
// Hand-drawn-style SVG icons for dietary constraints.
// Kept as inline React components so they're always available and themeable.

type IconProps = { size?: number; color?: string; className?: string };

const base = (size: number, color: string) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: color,
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

export function VeganIcon({ size = 18, color = "currentColor" }: IconProps) {
  return (
    <svg {...base(size, color)}>
      <path d="M11 18c0-5 4-9 9-9 0 5-4 9-9 9Z" />
      <path d="M11 18c0-4-3-7-7-7" />
      <path d="M11 18v3" />
    </svg>
  );
}

export function VegetarianIcon({ size = 18, color = "currentColor" }: IconProps) {
  return (
    <svg {...base(size, color)}>
      <path d="M12 3c-2 3-4 5-4 9a4 4 0 1 0 8 0c0-4-2-6-4-9Z" />
      <path d="M12 15v6" />
    </svg>
  );
}

export function GlutenFreeIcon({ size = 18, color = "currentColor" }: IconProps) {
  return (
    <svg {...base(size, color)}>
      <path d="M12 3v18" />
      <path d="M12 7c-2 0-3 1-3 2.5S10 12 12 12" />
      <path d="M12 7c2 0 3 1 3 2.5S14 12 12 12" />
      <path d="M12 13c-2 0-3 1-3 2.5S10 18 12 18" />
      <path d="M12 13c2 0 3 1 3 2.5S14 18 12 18" />
      <path d="M5 5l14 14" stroke={color} strokeWidth="2" />
    </svg>
  );
}

export function DairyFreeIcon({ size = 18, color = "currentColor" }: IconProps) {
  return (
    <svg {...base(size, color)}>
      <path d="M8 4h8l-1 4v10a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2V8L8 4Z" />
      <path d="M5 5l14 14" stroke={color} strokeWidth="2" />
    </svg>
  );
}

export function NutFreeIcon({ size = 18, color = "currentColor" }: IconProps) {
  return (
    <svg {...base(size, color)}>
      <ellipse cx="12" cy="12" rx="5" ry="7" />
      <path d="M12 5c0 3 0 7 0 14" />
      <path d="M5 5l14 14" stroke={color} strokeWidth="2" />
    </svg>
  );
}

export function EggFreeIcon({ size = 18, color = "currentColor" }: IconProps) {
  return (
    <svg {...base(size, color)}>
      <ellipse cx="12" cy="13" rx="5" ry="7" />
      <path d="M5 5l14 14" stroke={color} strokeWidth="2" />
    </svg>
  );
}

export function HalalIcon({ size = 18, color = "currentColor" }: IconProps) {
  return (
    <svg {...base(size, color)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12h8" />
      <path d="M9 10v4" />
      <path d="M15 10v4" />
    </svg>
  );
}

export function KosherIcon({ size = 18, color = "currentColor" }: IconProps) {
  return (
    <svg {...base(size, color)}>
      <path d="M12 3l3 6 6 0-5 4 2 6-6-4-6 4 2-6-5-4 6 0Z" />
    </svg>
  );
}

export function LowSodiumIcon({ size = 18, color = "currentColor" }: IconProps) {
  return (
    <svg {...base(size, color)}>
      <path d="M12 3v4" />
      <path d="M5 9h14l-1 11H6Z" />
      <path d="M9 13h6" />
    </svg>
  );
}

export function LowSugarIcon({ size = 18, color = "currentColor" }: IconProps) {
  return (
    <svg {...base(size, color)}>
      <rect x="6" y="7" width="12" height="10" rx="1" />
      <path d="M5 5l14 14" stroke={color} strokeWidth="2" />
    </svg>
  );
}

export const ConstraintIconMap: Record<string, (p: IconProps) => JSX.Element> = {
  vegan: VeganIcon,
  vegetarian: VegetarianIcon,
  gluten_free: GlutenFreeIcon,
  dairy_free: DairyFreeIcon,
  nut_free: NutFreeIcon,
  egg_free: EggFreeIcon,
  halal: HalalIcon,
  kosher: KosherIcon,
  low_sodium: LowSodiumIcon,
  low_sugar: LowSugarIcon,
};
