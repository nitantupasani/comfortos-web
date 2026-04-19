import { Link } from 'react-router-dom';

type Variation =
  | 'aurora'
  | 'bento'
  | 'kinetic'
  | 'editorial'
  | 'midnight'
  | 'cove'
  | 'original';

const variations: { key: Variation; label: string; to: string }[] = [
  { key: 'original', label: 'Original', to: '/landing-original' },
  { key: 'aurora', label: 'V1 · Aurora', to: '/v1' },
  { key: 'bento', label: 'V2 · Signal', to: '/v2' },
  { key: 'kinetic', label: 'V3 · Velocity', to: '/v3' },
  { key: 'editorial', label: 'V4 · Editorial', to: '/v4' },
  { key: 'midnight', label: 'V5 · Midnight', to: '/v5' },
  { key: 'cove', label: 'V6 · Cove', to: '/v6' },
];

export default function VariationsNav({
  active,
  theme = 'light',
}: {
  active: Variation;
  theme?: 'light' | 'dark';
}) {
  const isDark = theme === 'dark';
  return (
    <div
      className="fixed top-0 left-0 right-0 z-40 text-xs font-medium"
      style={{
        background: isDark ? 'rgba(9,9,11,0.85)' : 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(15,23,42,0.06)',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-10 flex items-center justify-between gap-3">
        <span className={`uppercase tracking-widest text-[10px] ${isDark ? 'text-zinc-500' : 'text-gray-400'}`}>
          Landing variations preview
        </span>
        <div className="flex items-center gap-1">
          {variations.map((v) => {
            const isActive = v.key === active;
            return (
              <Link
                key={v.key}
                to={v.to}
                className="px-3 py-1.5 rounded-full transition"
                style={{
                  background: isActive
                    ? isDark
                      ? '#10B981'
                      : '#2d6b4d'
                    : isDark
                    ? 'transparent'
                    : 'transparent',
                  color: isActive
                    ? isDark
                      ? '#0a0a0a'
                      : '#ffffff'
                    : isDark
                    ? '#a1a1aa'
                    : '#475569',
                }}
              >
                {v.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
