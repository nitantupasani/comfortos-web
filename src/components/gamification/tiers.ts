import type { EcoTier } from '../../types';

/**
 * Visual mapping for eco tiers. Thresholds + tier assignment are owned by the
 * backend (app/services/gamification.py); this is purely how each tier looks in
 * the web UI. Palette is ComfortOS teal, deepening as the tree grows.
 */
export interface TierVisual {
  key: EcoTier;
  label: string;
  /** Tailwind text colour for tier label/points */
  text: string;
  /** Tailwind badge background */
  bg: string;
  /** Tailwind ring/border colour for hero + podium */
  ring: string;
  /** SVG foliage fills (light highlight + darker base) */
  foliage: string;
  foliageDark: string;
  blurb: string;
}

export const TIER_VISUALS: Record<EcoTier, TierVisual> = {
  seedling: {
    key: 'seedling',
    label: 'Seedling',
    text: 'text-emerald-600',
    bg: 'bg-emerald-50',
    ring: 'ring-emerald-200',
    foliage: '#6ee7b7',
    foliageDark: '#34d399',
    blurb: 'Just sprouting — keep voting to grow.',
  },
  sapling: {
    key: 'sapling',
    label: 'Sapling',
    text: 'text-teal-600',
    bg: 'bg-teal-50',
    ring: 'ring-teal-200',
    foliage: '#5eead4',
    foliageDark: '#2dd4bf',
    blurb: 'Taking root. Nice momentum.',
  },
  young: {
    key: 'young',
    label: 'Young Tree',
    text: 'text-teal-700',
    bg: 'bg-teal-50',
    ring: 'ring-teal-300',
    foliage: '#2dd4bf',
    foliageDark: '#14b8a6',
    blurb: 'Growing strong on your feedback.',
  },
  tree: {
    key: 'tree',
    label: 'Tree',
    text: 'text-teal-800',
    bg: 'bg-teal-100',
    ring: 'ring-teal-400',
    foliage: '#14b8a6',
    foliageDark: '#0d9488',
    blurb: 'Fully grown. A pillar of the community.',
  },
  forest: {
    key: 'forest',
    label: 'Forest',
    text: 'text-teal-900',
    bg: 'bg-teal-100',
    ring: 'ring-teal-500',
    foliage: '#0d9488',
    foliageDark: '#0f766e',
    blurb: 'A whole forest. Legendary contributor.',
  },
};

/** Podium accent (rank 1/2/3) — warm metals that read well against teal. */
export const PODIUM = [
  { ring: 'ring-amber-400', bg: 'bg-amber-50', text: 'text-amber-600', label: '1' },
  { ring: 'ring-slate-300', bg: 'bg-slate-50', text: 'text-slate-500', label: '2' },
  { ring: 'ring-orange-300', bg: 'bg-orange-50', text: 'text-orange-600', label: '3' },
];
