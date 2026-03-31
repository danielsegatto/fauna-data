import { Trash2 } from "lucide-react";
import type { FaunaRecord } from "@/lib/types";

interface RecordListItemProps {
  record: FaunaRecord;
  metaLabel: string;
  onOpen: (recordId: string) => void;
  onDelete: (recordId: string) => void;
}

export function RecordListItem({ record, metaLabel, onOpen, onDelete }: RecordListItemProps) {
  return (
    <div className="relative rounded-xl bg-gray-50 border border-gray-100">
      <button
        onClick={() => onOpen(record.id)}
        className="w-full text-left px-3 py-2 pr-11 rounded-xl active:scale-[0.99] transition-all"
      >
        <p className="text-sm font-semibold text-gray-900 truncate">
          {record.data.species}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">
          {metaLabel}
        </p>
      </button>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDelete(record.id);
        }}
        className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 active:scale-95 transition-all"
        title="Deletar registro"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}