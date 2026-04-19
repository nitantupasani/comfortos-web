import type { ReactNode } from 'react';

interface SectionCardProps {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  icon?: ReactNode;
  children: ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

const PAD: Record<NonNullable<SectionCardProps['padding']>, string> = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-6',
};

export default function SectionCard({
  title,
  description,
  action,
  icon,
  children,
  padding = 'md',
  className = '',
}: SectionCardProps) {
  const hasHeader = Boolean(title || action);
  return (
    <section className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${className}`}>
      {hasHeader && (
        <header className="flex items-start justify-between gap-4 px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3 min-w-0">
            {icon && (
              <div className="shrink-0 w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
                {icon}
              </div>
            )}
            <div className="min-w-0">
              {title && <h3 className="font-semibold text-gray-900 text-sm truncate">{title}</h3>}
              {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
            </div>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      <div className={PAD[padding]}>{children}</div>
    </section>
  );
}
