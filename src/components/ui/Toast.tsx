import { useState, useEffect, useCallback } from "react";
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/theme";

type ToastType = "success" | "error" | "warning";
interface Toast { id: string; type: ToastType; message: string; exiting?: boolean; }

const listeners: Array<(toast: Toast) => void> = [];

export function showToast(type: ToastType, message: string) {
  const toast: Toast = { id: `${Date.now()}-${Math.random()}`, type, message };
  listeners.forEach((fn) => fn(toast));
}

const icons: Record<ToastType, typeof CheckCircle> = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
};

const styles: Record<ToastType, string> = {
  success: "bg-green-600 text-white",
  error: "bg-red-500 text-white",
  warning: "bg-amber-500 text-white",
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handler = (toast: Toast) => {
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => setToasts((prev) =>
        prev.map((t) => t.id === toast.id ? { ...t, exiting: true } : t)
      ), 2700);
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== toast.id)), 3000);
    };
    listeners.push(handler);
    return () => {
      const idx = listeners.indexOf(handler);
      if (idx > -1) listeners.splice(idx, 1);
    };
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.map((t) => t.id === id ? { ...t, exiting: true } : t));
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 300);
  }, []);

  return (
    <div className="fixed top-4 left-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => {
        const Icon = icons[toast.type];
        return (
          <div key={toast.id} className={cn("flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg pointer-events-auto transition-all duration-300", styles[toast.type], toast.exiting ? "opacity-0 -translate-y-1" : "opacity-100 translate-y-0")}>
            <Icon size={18} className="shrink-0" />
            <p className="flex-1 text-sm font-medium">{toast.message}</p>
            <button onClick={() => dismiss(toast.id)} className="shrink-0 opacity-80 active:opacity-100">
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
