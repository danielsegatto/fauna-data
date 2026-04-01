import { Pencil, Trash2, X } from "lucide-react";

interface RecordPageActionsProps {
  isEditing: boolean;
  onStartEdit: () => void;
  onDelete: () => void;
  onCancelEdit: () => void;
}

export function RecordPageActions({
  isEditing,
  onStartEdit,
  onDelete,
  onCancelEdit,
}: RecordPageActionsProps) {
  if (isEditing) {
    return (
      <button
        onClick={onCancelEdit}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 text-gray-600 text-sm font-semibold active:scale-95 transition-all"
      >
        <X size={15} />
        Cancelar
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onDelete}
        className="inline-flex items-center justify-center h-8 w-8 rounded-xl bg-red-50 text-red-600 text-sm font-semibold active:scale-95 transition-all hover:bg-red-100"
        aria-label="Deletar registro"
        title="Deletar registro"
      >
        <Trash2 size={15} />
      </button>
      <button
        onClick={onStartEdit}
        className="inline-flex items-center justify-center h-8 w-8 rounded-xl bg-primary/10 text-primary text-sm font-semibold active:scale-95 transition-all"
        aria-label="Editar registro"
        title="Editar registro"
      >
        <Pencil size={15} />
      </button>
    </div>
  );
}