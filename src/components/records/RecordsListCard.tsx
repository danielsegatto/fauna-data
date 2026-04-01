import { Card } from "@/components/ui";
import { RecordListItem } from "@/components/records/RecordListItem";
import { formatDateTime } from "@/lib/format";
import { type FaunaRecord } from "@/lib/types";
import { ReactNode } from "react";

interface RecordsListCardProps {
  records: FaunaRecord[];
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  emptyMessage?: string;
  onOpenRecord: (recordId: string) => void;
  onDeleteRecord: (recordId: string) => void;
}

export function RecordsListCard({
  records,
  title,
  subtitle,
  icon,
  emptyMessage = "Nenhum registro vinculado ainda.",
  onOpenRecord,
  onDeleteRecord,
}: RecordsListCardProps) {
  return (
    <Card padding="md">
      <div className="flex items-start gap-2 mb-3">
        {icon && <div className="shrink-0 mt-0.5">{icon}</div>}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-700">{title}</p>
          {subtitle && (
            <p className="text-xs text-gray-400">{subtitle}</p>
          )}
        </div>
      </div>

      {records.length === 0 ? (
        <p className="text-sm text-gray-400">{emptyMessage}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {records.map((record) => (
            <RecordListItem
              key={record.id}
              record={record}
              metaLabel={`${formatDateTime(record.timestamp)} • ${record.data.identification}`}
              onOpen={(recordId) => onOpenRecord(recordId)}
              onDelete={(recordId) => onDeleteRecord(recordId)}
            />
          ))}
        </div>
      )}
    </Card>
  );
}
