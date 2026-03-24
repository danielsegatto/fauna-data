interface DataChipProps {
  label: string;
  value: string;
}

export function DataChip({ label, value }: DataChipProps) {
  return (
    <div className="bg-gray-50 rounded-lg px-2 py-1.5">
      <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide leading-none mb-0.5">
        {label}
      </p>
      <p className="text-xs font-semibold text-gray-700 truncate">{value}</p>
    </div>
  );
}