"use client";

interface MiniTrendChartProps {
  data: number[];
  color?: string;
  height?: number;
}

export function MiniTrendChart({ data, color = "#10b981" }: MiniTrendChartProps) {
  if (!data || data.length < 2) return <div className="h-full flex items-center text-[10px] text-gray-600">Collecting data...</div>;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((val - min) / range) * 100;
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="w-full h-full min-h-[40px]">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
        <polygon
          fill="url(#gradient)"
          points={`0,100 ${points} 100,100`}
        />
      </svg>
    </div>
  );
}
