import type { ReactNode } from 'react';

interface Crumb {
  label: string;
  to?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Crumb[];
  actions?: ReactNode;
  icon?: ReactNode;
}

export default function PageHeader({ title, description, breadcrumbs, actions, icon }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 pb-5 mb-6 border-b border-gray-200">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1.5 text-xs text-gray-500">
          {breadcrumbs.map((c, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-gray-300">/</span>}
              {c.to ? (
                <a href={c.to} className="hover:text-primary-600 transition-colors">{c.label}</a>
              ) : (
                <span>{c.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="flex items-start gap-4 justify-between flex-wrap">
        <div className="flex items-start gap-3 min-w-0">
          {icon && (
            <div className="shrink-0 w-10 h-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
              {icon}
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">{title}</h1>
            {description && <p className="text-sm text-gray-500 mt-1 max-w-2xl">{description}</p>}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
      </div>
    </div>
  );
}
