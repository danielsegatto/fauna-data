/**
 * Core data types and constants for Fauna Data app.
 */

// ─── Enum Types ───────────────────────────────────────────────────────────────

export type FaunaGroup = "birds" | "mammals" | "herpetofauna";
export type IdentificationType = "A" | "V" | "AV";
export type EnvironmentType = "floresta" | "cerrado" | "campo" | "agua" | "urbano" | "outro";
export type StratumType = "solo" | "sub-bosque" | "dossel" | "aereo";
export type ActivityType = "repouso" | "alimentacao" | "voo" | "canto" | "ninhacao" | "outro";
export type SideType = "esquerda" | "direita" | "frente" | "tras";

// ─── Core Interfaces ─────────────────────────────────────────────────────────

export interface CollectionPoint {
  id: string;
  name: string;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  limit?: number;
  createdAt: number;
  group: FaunaGroup;
  methodology: string;
  notes?: string;
}

export interface ObservationData {
  species: string;
  identification: IdentificationType;
  environment: EnvironmentType;
  stratum: StratumType;
  activity: ActivityType;
  quantity: number;
  distance: number;
  side: SideType;
  observations: string;
}

export interface FaunaRecord {
  id: string;
  collectionPointId: string;
  group: FaunaGroup;
  methodology: string;
  timestamp: number;
  data: ObservationData;
}

// ─── Dropdown Options ─────────────────────────────────────────────────────────

export interface SelectOption {
  label: string;
  value: string;
}

export const IDENTIFICATION_OPTIONS: SelectOption[] = [
  { label: "Auditivo (A)", value: "A" },
  { label: "Visual (V)", value: "V" },
  { label: "Auditivo e Visual (AV)", value: "AV" },
];

export const ENVIRONMENT_OPTIONS: SelectOption[] = [
  { label: "Floresta", value: "floresta" },
  { label: "Cerrado", value: "cerrado" },
  { label: "Campo", value: "campo" },
  { label: "Água", value: "agua" },
  { label: "Urbano", value: "urbano" },
  { label: "Outro", value: "outro" },
];

export const STRATUM_OPTIONS: SelectOption[] = [
  { label: "Solo", value: "solo" },
  { label: "Sub-bosque", value: "sub-bosque" },
  { label: "Dossel", value: "dossel" },
  { label: "Aéreo", value: "aereo" },
];

export const ACTIVITY_OPTIONS: SelectOption[] = [
  { label: "Repouso", value: "repouso" },
  { label: "Alimentação", value: "alimentacao" },
  { label: "Voo", value: "voo" },
  { label: "Canto", value: "canto" },
  { label: "Ninhação", value: "ninhacao" },
  { label: "Outro", value: "outro" },
];

export const SIDE_OPTIONS: SelectOption[] = [
  { label: "Esquerda", value: "esquerda" },
  { label: "Direita", value: "direita" },
  { label: "Frente", value: "frente" },
  { label: "Trás", value: "tras" },
];

// ─── Methodologies ────────────────────────────────────────────────────────────

export interface Methodology {
  id: string;
  title: string;
  description: string;
}

export const METHODOLOGIES: Record<FaunaGroup, Methodology[]> = {
  birds: [
    { id: "point-count", title: "Ponto de Escuta", description: "Contagem de aves em ponto fixo" },
    { id: "transect", title: "Transecto", description: "Observação ao longo de uma linha" },
    { id: "mist-net", title: "Redes de Neblina", description: "Captura com redes para anilhamento" },
    { id: "mackinnon", title: "Lista de Mackinnon", description: "Lista de espécies observadas" },
    { id: "free-observation", title: "Observação Livre", description: "Observação sem metodologia específica" },
  ],
  mammals: [
    { id: "camera-trap", title: "Armadilha Fotográfica", description: "Registro por câmera de trilha" },
    { id: "transect", title: "Transecto", description: "Observação ao longo de uma linha" },
    { id: "track-station", title: "Estação de Pegadas", description: "Registro de rastros e pegadas" },
    { id: "live-trap", title: "Armadilha de Gaiola", description: "Captura e soltura de pequenos mamíferos" },
  ],
  herpetofauna: [
    { id: "visual-search", title: "Busca Visual", description: "Busca ativa de répteis e anfíbios" },
    { id: "pitfall", title: "Armadilha de Queda", description: "Captura com baldes enterrados" },
    { id: "transect", title: "Transecto", description: "Observação ao longo de uma linha" },
    { id: "acoustic", title: "Monitoramento Acústico", description: "Registro de vocalização de anfíbios" },
  ],
};

// ─── Group Metadata ───────────────────────────────────────────────────────────

export const GROUP_LABELS: Record<FaunaGroup, string> = {
  birds: "Aves",
  mammals: "Mamíferos",
  herpetofauna: "Herpetofauna",
};

export const METHODOLOGY_LABELS: Record<string, string> = {
  "point-count": "Ponto de Escuta",
  transect: "Transecto",
  "mist-net": "Redes de Neblina",
  mackinnon: "Lista de Mackinnon",
  "free-observation": "Observação Livre",
  "camera-trap": "Armadilha Fotográfica",
  "track-station": "Estação de Pegadas",
  "live-trap": "Armadilha de Gaiola",
  "visual-search": "Busca Visual",
  pitfall: "Armadilha de Queda",
  acoustic: "Monitoramento Acústico",
};
