import { ReactNode } from "react";
import {
  Volume2,
  Eye,
  Minus,
  Plus,
  ArrowUp,
  ArrowLeft,
  ArrowRight,
  ArrowDown,
} from "lucide-react";
import {
  Input,
  Textarea,
  Select,
  OptionGroup,
} from "@/components/ui";
import { SpeciesAutocompleteInput } from "./SpeciesAutocompleteInput";
import { cn } from "@/lib/theme";
import type {
  FaunaGroup,
  SideType,
  SelectOption,
} from "@/lib/types";

// ─── Species Field ────────────────────────────────────────────────────────

export interface SpeciesFieldProps {
  group: FaunaGroup;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  label?: string;
}

export function SpeciesField({
  group,
  value,
  onChange,
  error,
  placeholder = "Ex: Araçari-de-bico-preto",
  label = "Espécie *",
}: SpeciesFieldProps) {
  return (
    <SpeciesAutocompleteInput
      group={group}
      label={label}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      error={error}
    />
  );
}

// ─── Identification Field (Toggle version) ────────────────────────────────

export interface IdentificationToggleProps {
  value: string;
  onAudioChange: (selected: boolean) => void;
  onVisualChange: (selected: boolean) => void;
  isAudioSelected: boolean;
  isVisualSelected: boolean;
  error?: string;
}

export function IdentificationToggle({
  onAudioChange,
  onVisualChange,
  isAudioSelected,
  isVisualSelected,
  error,
}: IdentificationToggleProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-gray-700">
        Identificação *
      </label>
      <div className="grid grid-cols-2 gap-2" role="group" aria-label="Identificação">
        <button
          type="button"
          onClick={() => onAudioChange(!isAudioSelected)}
          aria-pressed={isAudioSelected}
          className={cn(
            "w-full min-h-[44px] px-4 py-2.5 rounded-xl border text-sm font-medium",
            "focus:outline-none focus:ring-2 focus:ring-primary/40",
            "active:scale-95 transition-all duration-150 select-none",
            "flex items-center justify-center gap-2",
            isAudioSelected
              ? "border-primary bg-primary/10 text-primary"
              : "border-gray-200 bg-gray-50 text-gray-700 active:bg-gray-100",
            error && !isAudioSelected && "border-red-200"
          )}
        >
          <Volume2 size={16} aria-hidden="true" />
          <span>Auditivo (A)</span>
        </button>

        <button
          type="button"
          onClick={() => onVisualChange(!isVisualSelected)}
          aria-pressed={isVisualSelected}
          className={cn(
            "w-full min-h-[44px] px-4 py-2.5 rounded-xl border text-sm font-medium",
            "focus:outline-none focus:ring-2 focus:ring-primary/40",
            "active:scale-95 transition-all duration-150 select-none",
            "flex items-center justify-center gap-2",
            isVisualSelected
              ? "border-primary bg-primary/10 text-primary"
              : "border-gray-200 bg-gray-50 text-gray-700 active:bg-gray-100",
            error && !isVisualSelected && "border-red-200"
          )}
        >
          <Eye size={16} aria-hidden="true" />
          <span>Visual (V)</span>
        </button>
      </div>
      {error && <p className="text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
}

// ─── Identification Field (Select version) ────────────────────────────────

export interface IdentificationSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  error?: string;
  label?: string;
}

export function IdentificationSelect({
  value,
  onChange,
  options,
  error,
  label = "Identificação *",
}: IdentificationSelectProps) {
  return (
    <Select
      label={label}
      options={options}
      value={value}
      onChange={onChange}
      error={error}
    />
  );
}

// ─── Environment Field ────────────────────────────────────────────────────

export interface EnvironmentFieldProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  error?: string;
  label?: string;
}

export function EnvironmentField({
  value,
  onChange,
  options,
  error,
  label = "Ambiente *",
}: EnvironmentFieldProps) {
  return (
    <Select
      label={label}
      options={options}
      value={value}
      onChange={onChange}
      placeholder="Ex: Floresta"
      error={error}
      searchable
      allowCustomValue
    />
  );
}

// ─── Stratum Field ────────────────────────────────────────────────────────

export interface StratumFieldProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  error?: string;
  label?: string;
}

export function StratumField({
  value,
  onChange,
  options,
  error,
  label = "Estrato",
}: StratumFieldProps) {
  return (
    <OptionGroup
      label={label}
      options={options}
      value={value}
      onChange={onChange}
      error={error}
      allowClear
    />
  );
}

// ─── Activity Field ───────────────────────────────────────────────────────

export interface ActivityFieldProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  error?: string;
  label?: string;
}

export function ActivityField({
  value,
  onChange,
  options,
  error,
  label = "Atividade",
}: ActivityFieldProps) {
  return (
    <OptionGroup
      label={label}
      options={options}
      value={value}
      onChange={onChange}
      error={error}
      allowClear
    />
  );
}

// ─── Quantity Field (Simple Input) ────────────────────────────────────────

export interface QuantityInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  label?: string;
}

export function QuantityInput({
  value,
  onChange,
  error,
  label = "Quantidade *",
}: QuantityInputProps) {
  return (
    <Input
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      inputMode="numeric"
      error={error}
    />
  );
}

// ─── Quantity Field (Stepper version) ──────────────────────────────────────

export interface QuantityStepperProps {
  value: string;
  onChange: (value: string) => void;
  onDecrease: () => void;
  onIncrease: () => void;
  error?: string;
  label?: string;
}

export function QuantityStepper({
  value,
  onChange,
  onDecrease,
  onIncrease,
  error,
  label = "Quantidade *",
}: QuantityStepperProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="quantidade" className="text-sm font-semibold text-gray-700">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onDecrease}
          className="min-h-[44px] min-w-[44px] rounded-xl border border-gray-200 bg-gray-50 text-gray-700 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary/40 active:scale-95 transition-all duration-150"
          aria-label="Diminuir quantidade"
        >
          <Minus size={16} className="shrink-0" aria-hidden="true" />
        </button>

        <input
          id="quantidade"
          className={cn(
            "flex-1 min-w-0 px-4 py-3 rounded-xl border bg-white text-gray-900 text-base placeholder-gray-400 text-center",
            "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors duration-150",
            error ? "border-red-400 focus:ring-red-200 focus:border-red-400" : "border-gray-200"
          )}
          type="tel"
          placeholder="Ex: 1"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          inputMode="numeric"
          pattern="[0-9]*"
        />

        <button
          type="button"
          onClick={onIncrease}
          className="min-h-[44px] min-w-[44px] rounded-xl border border-gray-200 bg-gray-50 text-gray-700 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary/40 active:scale-95 transition-all duration-150"
          aria-label="Aumentar quantidade"
        >
          <Plus size={16} className="shrink-0" aria-hidden="true" />
        </button>
      </div>
      {error && <p className="text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
}

// ─── Distance Field (Simple Input) ────────────────────────────────────────

export interface DistanceInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  error?: string;
  label?: string;
}

export function DistanceInput({
  value,
  onChange,
  onClear,
  error,
  label = "Distância (m)",
}: DistanceInputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor="distancia" className="text-sm font-semibold text-gray-700">
          {label}
        </label>
        {value && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-semibold text-gray-500 active:text-gray-700"
          >
            Limpar
          </button>
        )}
      </div>

      <input
        id="distancia"
        className={cn(
          "w-full px-4 py-3 rounded-xl border bg-white text-gray-900 text-base placeholder-gray-400 text-center",
          "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors duration-150",
          error ? "border-red-400 focus:ring-red-200 focus:border-red-400" : "border-gray-200"
        )}
        type="tel"
        placeholder="m"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        inputMode="numeric"
        pattern="[0-9]*"
      />

      {error && <p className="text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
}

// ─── Distance Field (Stepper + Presets version) ────────────────────────────

export interface DistanceStepperProps {
  value: string;
  onChange: (value: string) => void;
  onDecrease: () => void;
  onIncrease: () => void;
  onClear?: () => void;
  presets?: number[];
  error?: string;
  label?: string;
}

export function DistanceStepper({
  value,
  onChange,
  onDecrease,
  onIncrease,
  onClear,
  presets = [1, 5, 10, 20, 50],
  error,
  label = "Distância (m)",
}: DistanceStepperProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <label className="text-sm font-semibold text-gray-700">{label}</label>
        {value && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-semibold text-gray-500 active:text-gray-700"
          >
            Limpar
          </button>
        )}
      </div>

      {/* Presets */}
      <div className="flex gap-1.5">
        {presets.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => onChange(String(preset))}
            className={cn(
              "flex-1 min-h-[36px] rounded-xl border text-xs font-semibold",
              "focus:outline-none focus:ring-2 focus:ring-primary/40",
              "active:scale-95 transition-all duration-150 select-none",
              value === String(preset)
                ? "border-primary bg-primary/10 text-primary"
                : "border-gray-200 bg-gray-50 text-gray-600 active:bg-gray-100"
            )}
          >
            {preset}
          </button>
        ))}
      </div>

      {/* Stepper + typed input */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onDecrease}
          className="min-h-[44px] min-w-[44px] rounded-xl border border-gray-200 bg-gray-50 text-gray-700 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary/40 active:scale-95 transition-all duration-150"
          aria-label="Diminuir distância"
        >
          <Minus size={16} className="shrink-0" aria-hidden="true" />
        </button>

        <input
          className={cn(
            "flex-1 min-w-0 px-4 py-3 rounded-xl border bg-white text-gray-900 text-base placeholder-gray-400 text-center",
            "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors duration-150",
            error ? "border-red-400 focus:ring-red-200 focus:border-red-400" : "border-gray-200"
          )}
          type="tel"
          placeholder="m"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          inputMode="numeric"
          pattern="[0-9]*"
        />

        <button
          type="button"
          onClick={onIncrease}
          className="min-h-[44px] min-w-[44px] rounded-xl border border-gray-200 bg-gray-50 text-gray-700 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary/40 active:scale-95 transition-all duration-150"
          aria-label="Aumentar distância"
        >
          <Plus size={16} className="shrink-0" aria-hidden="true" />
        </button>
      </div>

      {error && <p className="text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
}

// ─── Side Field (Grid version) ────────────────────────────────────────────

export interface SideGridProps {
  value: string;
  onChange: (value: SideType) => void;
  onClear?: () => void;
  error?: string;
  label?: string;
}

export function SideGrid({
  value,
  onChange,
  onClear,
  error,
  label = "Lado",
}: SideGridProps) {
  const sides: Array<{
    value: SideType;
    label: string;
    icon: ReactNode;
    colStart: number;
    rowStart: number;
  }> = [
    { value: "frente", label: "Frente", icon: <ArrowUp size={16} />, colStart: 2, rowStart: 1 },
    { value: "esquerda", label: "Esquerda", icon: <ArrowLeft size={16} />, colStart: 1, rowStart: 2 },
    { value: "direita", label: "Direita", icon: <ArrowRight size={16} />, colStart: 3, rowStart: 2 },
    { value: "tras", label: "Trás", icon: <ArrowDown size={16} />, colStart: 2, rowStart: 3 },
  ];

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <label className="text-sm font-semibold text-gray-700">{label}</label>
        {value && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-semibold text-gray-500 active:text-gray-700"
          >
            Limpar
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 grid-rows-3 gap-2" role="radiogroup" aria-label={label}>
        {sides.map(({ value: sideValue, label: sideLabel, icon, colStart, rowStart }) => (
          <button
            key={sideValue}
            type="button"
            role="radio"
            aria-checked={value === sideValue}
            onClick={() => onChange(sideValue)}
            style={{
              gridColumn: `${colStart}`,
              gridRow: `${rowStart}`,
            } as React.CSSProperties}
            className={cn(
              "w-full min-h-[44px] px-4 py-2.5 rounded-xl border text-sm font-medium",
              "focus:outline-none focus:ring-2 focus:ring-primary/40",
              "active:scale-95 transition-all duration-150 select-none",
              "flex items-center justify-center gap-2",
              value === sideValue
                ? "border-primary bg-primary/10 text-primary"
                : "border-gray-200 bg-gray-50 text-gray-700 active:bg-gray-100",
              error && value !== sideValue && "border-red-200"
            )}
          >
            {icon}
            <span>{sideLabel}</span>
          </button>
        ))}
      </div>

      {error && <p className="text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
}

// ─── Side Field (Select version) ──────────────────────────────────────────

export interface SideSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  error?: string;
  label?: string;
}

export function SideSelect({
  value,
  onChange,
  options,
  error,
  label = "Lado",
}: SideSelectProps) {
  return (
    <Select
      label={label}
      options={options}
      value={value}
      onChange={onChange}
      error={error}
    />
  );
}

// ─── Observations Field ──────────────────────────────────────────────────

export interface ObservationsFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  label?: string;
  placeholder?: string;
  rows?: number;
}

export function ObservationsField({
  value,
  onChange,
  error,
  label = "Observações (opcional)",
  placeholder = "Notas adicionais sobre a observação...",
  rows = 3,
}: ObservationsFieldProps) {
  return (
    <Textarea
      label={label}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      error={error}
    />
  );
}
