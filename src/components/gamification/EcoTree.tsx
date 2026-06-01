import type { EcoTier } from '../../types';
import { TIER_VISUALS } from './tiers';

const TRUNK = '#92633c';
const TRUNK_DARK = '#7a4f2e';

interface EcoTreeProps {
  tier: EcoTier;
  size?: number;
  className?: string;
}

/**
 * A sustainable tree that grows with the occupant's eco tier. Pure inline SVG
 * (no dependency), ComfortOS-teal foliage that deepens as the tree matures:
 * seedling → sapling → young → tree → forest.
 */
export default function EcoTree({ tier, size = 48, className }: EcoTreeProps) {
  const v = TIER_VISUALS[tier];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label={`${v.label} tree`}
    >
      {/* ground shadow */}
      <ellipse cx="32" cy="59" rx="19" ry="3.5" fill="#0d9488" opacity="0.12" />
      <Stage tier={tier} light={v.foliage} dark={v.foliageDark} />
    </svg>
  );
}

/** Two-circle canopy blob for depth (dark base + lighter highlight). */
function Canopy({ cx, cy, r, light, dark }: { cx: number; cy: number; r: number; light: string; dark: string }) {
  return (
    <>
      <circle cx={cx} cy={cy} r={r} fill={dark} />
      <circle cx={cx - r * 0.28} cy={cy - r * 0.28} r={r * 0.74} fill={light} />
    </>
  );
}

function Stage({ tier, light, dark }: { tier: EcoTier; light: string; dark: string }) {
  switch (tier) {
    case 'seedling':
      return (
        <>
          <rect x="30.5" y="42" width="3" height="16" rx="1.5" fill={TRUNK} />
          <ellipse cx="24" cy="44" rx="7.5" ry="4.2" fill={dark} transform="rotate(-32 24 44)" />
          <ellipse cx="40" cy="42" rx="7.5" ry="4.2" fill={light} transform="rotate(32 40 42)" />
        </>
      );
    case 'sapling':
      return (
        <>
          <rect x="29.5" y="34" width="5" height="24" rx="2.5" fill={TRUNK} />
          <Canopy cx={32} cy={28} r={12} light={light} dark={dark} />
        </>
      );
    case 'young':
      return (
        <>
          <rect x="29" y="32" width="6" height="26" rx="3" fill={TRUNK} />
          <Canopy cx={24} cy={28} r={10} light={light} dark={dark} />
          <Canopy cx={38} cy={26} r={11} light={light} dark={dark} />
          <Canopy cx={32} cy={20} r={12} light={light} dark={dark} />
        </>
      );
    case 'tree':
      return (
        <>
          <rect x="28.5" y="32" width="7" height="26" rx="3.5" fill={TRUNK} />
          <rect x="28.5" y="32" width="3" height="26" rx="1.5" fill={TRUNK_DARK} opacity="0.5" />
          <Canopy cx={21} cy={28} r={11} light={light} dark={dark} />
          <Canopy cx={43} cy={28} r={11} light={light} dark={dark} />
          <Canopy cx={32} cy={30} r={12} light={light} dark={dark} />
          <Canopy cx={32} cy={17} r={14} light={light} dark={dark} />
        </>
      );
    case 'forest':
      return (
        <>
          {/* left + right smaller trees */}
          <rect x="13.5" y="40" width="4" height="18" rx="2" fill={TRUNK} />
          <Canopy cx={15.5} cy={34} r={9} light={light} dark={dark} />
          <rect x="46.5" y="40" width="4" height="18" rx="2" fill={TRUNK} />
          <Canopy cx={48.5} cy={34} r={9} light={light} dark={dark} />
          {/* central main tree */}
          <rect x="29.5" y="34" width="6" height="24" rx="3" fill={TRUNK} />
          <rect x="29.5" y="34" width="2.6" height="24" rx="1.3" fill={TRUNK_DARK} opacity="0.5" />
          <Canopy cx={23} cy={28} r={11} light={light} dark={dark} />
          <Canopy cx={41} cy={28} r={11} light={light} dark={dark} />
          <Canopy cx={32} cy={16} r={14} light={light} dark={dark} />
        </>
      );
  }
}
