interface HBarProps {
  label: string;
  value: number;
  max: number;
  color: string;
  rank?: number;
}

export function HBar({ label, value, max, color, rank }: HBarProps) {
  const pct = max > 0 ? (value / max) * 100 : 0;

  return (
    <div className="flex items-center gap-2">
      {rank !== undefined && (
        <span className="text-xs text-gray-400 w-4 text-right shrink-0">{rank}.</span>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-xs font-medium text-gray-700 truncate pr-2">{label}</span>
          <span className="text-xs font-bold text-gray-900 shrink-0">{value}</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, backgroundColor: color }}
          />
        </div>
      </div>
    </div>
  );
}