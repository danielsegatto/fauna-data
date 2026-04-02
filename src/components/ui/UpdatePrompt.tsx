import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

interface UpdatePromptProps {
  isOpen: boolean;
  onReload: () => void;
  onLater: () => void;
}

export function UpdatePrompt({ isOpen, onReload, onLater }: UpdatePromptProps) {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      title="Atualizacao disponivel"
      message="Uma nova versao do Fauna Data esta pronta. Atualize agora para usar a versao mais recente."
      confirmLabel="Atualizar agora"
      cancelLabel="Depois"
      variant="primary"
      onConfirm={onReload}
      onCancel={onLater}
    />
  );
}
