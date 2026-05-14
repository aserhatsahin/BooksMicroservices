import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: ReactNode;
  iconBg: string;
  iconColor: string;
}

export const StatCard = ({ label, value, icon, iconBg, iconColor }: StatCardProps) => (
  <div className="bg-base-100 rounded-2xl border border-base-200 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 animate-fade-in-up">
    <div className="flex items-center justify-between mb-4">
      <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center ${iconColor} [&>svg]:w-4 [&>svg]:h-4`}>
        {icon}
      </div>
    </div>
    <div className="text-3xl font-black text-base-content tracking-tighter">{value}</div>
    <div className="text-xs font-bold uppercase tracking-widest text-base-content/35 mt-1">{label}</div>
  </div>
);
