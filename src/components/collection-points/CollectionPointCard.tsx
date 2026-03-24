import { ChevronRight } from "lucide-react";
import { Badge, Card } from "@/components/ui";
import { formatDateTime } from "@/lib/format";
import { isMackinnonMethodology } from "@/lib/mackinnon";
import {
  GROUP_LABELS,
  METHODOLOGY_LABELS,
  type CollectionPoint,
} from "@/lib/types";

interface CollectionPointCardProps {
  point: CollectionPoint;
  recordsCount: number;
  onOpen: () => void;
}

export function CollectionPointCard({
  point,
  recordsCount,
  onOpen,
}: CollectionPointCardProps) {
  return (
    <Card pressable padding="none" onClick={onOpen} className="overflow-hidden">
      <div className="p-4 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-base font-bold text-gray-900 truncate">{point.name}</p>
            <Badge variant="group" group={point.group}>
              {GROUP_LABELS[point.group]}
            </Badge>
          </div>
          <p className="text-sm text-gray-500 truncate">
            {METHODOLOGY_LABELS[point.methodology] ?? point.methodology}
          </p>
          <p className="text-xs text-gray-400 mt-1">{formatDateTime(point.createdAt)}</p>
          <p className="text-xs text-gray-500 mt-2">
            {isMackinnonMethodology(point.methodology) && point.limit !== undefined
              ? `${recordsCount}/${point.limit} registros`
              : `${recordsCount} registro${recordsCount !== 1 ? "s" : ""} associado${recordsCount !== 1 ? "s" : ""}`}
          </p>
        </div>
        <ChevronRight size={18} className="text-gray-300 shrink-0 mt-1" />
      </div>
    </Card>
  );
}