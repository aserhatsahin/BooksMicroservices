import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
}

export const EmptyState = ({ icon, title, subtitle }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-28 text-base-content/25 select-none">
    <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-base-300 flex items-center justify-center mb-4 [&>svg]:w-7 [&>svg]:h-7">
      {icon}
    </div>
    <p className="font-bold text-sm">{title}</p>
    {subtitle && <p className="text-xs mt-1 text-base-content/30">{subtitle}</p>}
  </div>
);
