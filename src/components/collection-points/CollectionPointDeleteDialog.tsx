import { ConfirmDialog } from "@/components/ui";

interface CollectionPointDeleteDialogProps {
  isOpen: boolean;
  pointName?: string;
  recordsCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export function CollectionPointDeleteDialog({
  isOpen,
  pointName,
  recordsCount,
  onConfirm,
  onCancel,
}: CollectionPointDeleteDialogProps) {
  const pointLabel = pointName ? `o ponto ${pointName}` : "este ponto de coleta";
  const recordsMessage = recordsCount > 0
    ? ` Todos os ${recordsCount} registro${recordsCount !== 1 ? "s vinculados também serão removidos" : " vinculado também será removido"}.`
    : "";

  return (
    <ConfirmDialog
      isOpen={isOpen}
      title="Remover Ponto de Coleta"
      message={`Você tem certeza que deseja remover ${pointLabel}? Esta ação não pode ser desfeita.${recordsMessage}`}
      confirmLabel="Remover"
      cancelLabel="Cancelar"
      variant="danger"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}