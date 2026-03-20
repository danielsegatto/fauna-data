import { cn } from "@/lib/theme";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ isOpen, title, message, confirmLabel = "Confirmar", cancelLabel = "Cancelar", variant = "danger", onConfirm, onCancel }: ConfirmDialogProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl p-5 flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-500 mt-1">{message}</p>
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={onConfirm}
            className={cn(
              "w-full py-3 rounded-xl font-semibold text-base transition-all duration-150 active:scale-95",
              variant === "danger" ? "bg-red-500 text-white active:bg-red-600" : "bg-primary text-white active:bg-primary-dark"
            )}
          >
            {confirmLabel}
          </button>
          <button onClick={onCancel} className="w-full py-3 rounded-xl font-semibold text-base text-gray-700 bg-gray-100 active:bg-gray-200 transition-all duration-150 active:scale-95">
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
