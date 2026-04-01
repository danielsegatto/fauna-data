import { FaCircleQuestion, FaFeatherPointed, FaFrog, FaPaw } from "react-icons/fa6";
import { type IconType } from "react-icons";
import { type FaunaGroup } from "@/lib/types";

export type GroupShapeToken = "rounded" | "circle" | "squircle";

export interface GroupVisualConfig {
  icon: IconType;
  label: string;
  shape: GroupShapeToken;
}

const DEFAULT_GROUP_VISUAL: GroupVisualConfig = {
  icon: FaCircleQuestion,
  label: "Grupo",
  shape: "rounded",
};

export const GROUP_VISUALS: Record<FaunaGroup, GroupVisualConfig> = {
  birds: {
    icon: FaFeatherPointed,
    label: "Aves",
    shape: "rounded",
  },
  mammals: {
    icon: FaPaw,
    label: "Mamiferos",
    shape: "rounded",
  },
  herpetofauna: {
    icon: FaFrog,
    label: "Herpetofauna",
    shape: "rounded",
  },
};

export function getGroupVisual(group: FaunaGroup): GroupVisualConfig {
  return GROUP_VISUALS[group] ?? DEFAULT_GROUP_VISUAL;
}