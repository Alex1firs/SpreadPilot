import clsx from 'clsx';
import { ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  value: string | ReactNode;
  icon: ReactNode;
  trend?: string;
  trendUp?: boolean;
}

export function MetricCard({ title, value, icon, trend, trendUp }: MetricCardProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col relative overflow-hidden group hover:border-gray-700 transition-colors">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="flex justify-between items-start mb-4 relative">
        <h3 className="text-gray-400 font-medium text-sm">{title}</h3>
        <div className="text-emerald-500 bg-emerald-500/10 p-2 rounded-lg">
          {icon}
        </div>
      </div>
      <div className="flex items-baseline gap-2 relative">
        <span className="text-2xl font-bold text-white">{value}</span>
        {trend && (
          <span className={clsx("text-xs font-medium", trendUp ? "text-emerald-400" : "text-red-400")}>
            {trendUp ? '↑' : '↓'} {trend}
          </span>
        )}
      </div>
    </div>
  );
}
