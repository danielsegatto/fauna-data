import { MACKINNON_LIMIT_OPTIONS } from "@/lib/mackinnon";
import { Input } from "@/components/ui";

interface MackinnonLimitFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function MackinnonLimitField({ value, onChange, error }: MackinnonLimitFieldProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {MACKINNON_LIMIT_OPTIONS.map((option) => {
          const isSelected = value.trim() === String(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(String(option))}
              className={[
                "px-3 py-2 rounded-xl text-sm font-semibold border transition-all active:scale-95",
                isSelected
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-gray-200 bg-gray-50 text-gray-600",
              ].join(" ")}
            >
              {option}
            </button>
          );
        })}
      </div>

      <Input
        label="Limite da Lista de Mackinnon *"
        placeholder="Ex: 10"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        inputMode="numeric"
        hint="Sugestões rápidas: 10, 15 ou 20. Você também pode informar outro número inteiro."
        error={error}
      />
    </div>
  );
}
