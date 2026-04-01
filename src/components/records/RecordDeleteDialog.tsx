import { ConfirmDialog } from "@/components/ui";

interface RecordDeleteDialogProps {
  isOpen: boolean;
  species?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function RecordDeleteDialog({
  isOpen,
  species,
  onConfirm,
  onCancel,
}: RecordDeleteDialogProps) {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      title="Remover Registro"
      message={species
        ? `Você tem certeza que deseja remover o registro de ${species}? Esta ação não pode ser desfeita.`
        : "Você tem certeza que deseja remover este registro? Esta ação não pode ser desfeita."}
      confirmLabel="Remover"
      cancelLabel="Cancelar"
      variant="danger"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}