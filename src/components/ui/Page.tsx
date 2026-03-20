import { type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/theme";

interface PageProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  back?: boolean | string;
  actions?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function Page({ title, subtitle, children, back, actions, footer, className }: PageProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (typeof back === "string") navigate(back);
    else navigate(-1);
  };

  return (
    <div className="flex flex-col min-h-dvh bg-gray-50">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 px-4 py-3 min-h-[60px]">
          {back !== undefined && (
            <button
              onClick={handleBack}
              className="flex items-center justify-center w-9 h-9 rounded-xl bg-gray-50 border border-gray-200 text-gray-600 active:scale-95 active:bg-gray-100 transition-all duration-150 shrink-0"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-gray-900 truncate">{title}</h1>
            {subtitle && <p className="text-xs text-gray-500 truncate mt-0.5">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </div>
      </header>
      <main className={cn("flex-1 overflow-y-auto", footer ? "pb-24" : "pb-6", className)}>
        {children}
      </main>
      {footer && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
          {footer}
        </div>
      )}
    </div>
  );
}
