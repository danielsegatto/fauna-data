import { CheckCircle } from "lucide-react";
import { Card } from "@/components/ui";
import { theme } from "@/lib/theme";
import { type FaunaGroup } from "@/lib/types";

interface DataEntryContextCardProps {
  group: FaunaGroup;
  pointId?: string;
  pointName?: string;
  savedCount: number;
}

export function DataEntryContextCard({
  group,
  pointId,
  pointName,
  savedCount,
}: DataEntryContextCardProps) {
  const { color, bg } = theme.groups[group] ?? theme.groups.birds;

  return (
    <Card padding="md">
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: bg }}
        >
          <CheckCircle size={18} color={color} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-400 font-medium">Ponto de Coleta</p>
          <p className="text-sm font-semibold text-gray-900 truncate">
            {pointName ?? pointId}
          </p>
        </div>
        {savedCount > 0 && (
          <div
            className="px-2.5 py-1 rounded-full text-xs font-bold text-white"
            style={{ backgroundColor: color }}
          >
            {savedCount} salvo{savedCount !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    </Card>
  );
}