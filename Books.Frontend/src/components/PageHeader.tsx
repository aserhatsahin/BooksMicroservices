import type { ReactNode } from 'react';

interface PageHeaderProps {
  section: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export const PageHeader = ({ section, title, subtitle, action }: PageHeaderProps) => (
  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
    <div>
      <p className="text-xs font-bold uppercase tracking-widest text-primary/70 mb-1">{section}</p>
      <h1 className="text-3xl font-black text-base-content tracking-tight leading-none">{title}</h1>
      {subtitle && <p className="text-sm text-base-content/40 mt-1.5 font-medium">{subtitle}</p>}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);
