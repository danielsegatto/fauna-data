import { type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/theme";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, className, id, ...props }: InputProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-semibold text-gray-700">{label}</label>
      <input
        id={inputId}
        className={cn(
          "w-full px-4 py-3 rounded-xl border bg-white text-gray-900 text-base placeholder-gray-400",
          "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors duration-150",
          error ? "border-red-400 focus:ring-red-200 focus:border-red-400" : "border-gray-200",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs font-medium text-red-500">{error}</p>}
      {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

export function Textarea({ label, error, hint, className, id, rows = 3, ...props }: TextareaProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-semibold text-gray-700">{label}</label>
      <textarea
        id={inputId}
        rows={rows}
        className={cn(
          "w-full px-4 py-3 rounded-xl border bg-white text-gray-900 text-base placeholder-gray-400 resize-none",
          "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors duration-150",
          error ? "border-red-400 focus:ring-red-200 focus:border-red-400" : "border-gray-200",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs font-medium text-red-500">{error}</p>}
      {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
}