import { useParams, useNavigate } from "react-router-dom";
import { Page, Card, EmptyState } from "@/components/ui";
import { METHODOLOGIES, GROUP_LABELS, type FaunaGroup } from "@/lib/types";
import { theme } from "@/lib/theme";
import {
  Ear,
  ArrowLeftRight,
  Grid2x2,
  List,
  Binoculars,
  Camera,
  Footprints,
  MapPin,
  Rat,
  Search,
  Container,
  
  Volume2,
} from "lucide-react";

// ─── Icon map per methodology ID ─────────────────────────────────────────────

const METHODOLOGY_ICONS: Record<string, React.FC<{ size: number; color: string }>> = {
  "point-count":      ({ size, color }) => <Ear size={size} color={color} />,
  "transect":         ({ size, color }) => <ArrowLeftRight size={size} color={color} />,
  "mist-net":         ({ size, color }) => <Grid2x2 size={size} color={color} />,
  "mackinnon":        ({ size, color }) => <List size={size} color={color} />,
  "free-observation": ({ size, color }) => <Binoculars size={size} color={color} />,
  "camera-trap":      ({ size, color }) => <Camera size={size} color={color} />,
  "track-station":    ({ size, color }) => <Footprints size={size} color={color} />,
  "live-trap":        ({ size, color }) => <Rat size={size} color={color} />,
  "visual-search":    ({ size, color }) => <Search size={size} color={color} />,
  "pitfall":          ({ size, color }) => <Container size={size} color={color} />,
  "acoustic":         ({ size, color }) => <Volume2 size={size} color={color} />,
};

const FallbackIcon = ({ size, color }: { size: number; color: string }) => (
  <MapPin size={size} color={color} />
);

// ─── Component ────────────────────────────────────────────────────────────────

export default function MethodologiesPage() {
  const { group } = useParams<{ group: string }>();
  const navigate = useNavigate();

  const faunaGroup = group as FaunaGroup;
  const methodologies = METHODOLOGIES[faunaGroup] ?? [];
  const groupLabel = GROUP_LABELS[faunaGroup] ?? group;
  const { color, bg } = theme.groups[faunaGroup] ?? theme.groups.birds;

  const handleSelect = (methodologyId: string) => {
    navigate(`/collection-point/${faunaGroup}/${methodologyId}`);
  };

  return (
    <Page
      title={groupLabel}
      subtitle="Selecione a metodologia"
      back
    >
      <div className="px-4 pt-5 pb-4 flex flex-col gap-3">
        {/* Section label */}
        <p className="text-sm font-semibold text-gray-400 uppercase tracking-wide px-1">
          Metodologias disponíveis
        </p>

        {/* Methodology cards */}
        {methodologies.length === 0 ? (
          <EmptyState
            icon={<MapPin size={48} />}
            title="Nenhuma metodologia disponível"
            description="Este grupo ainda não possui metodologias cadastradas."
          />
        ) : (
          <div className="flex flex-col gap-3">
            {methodologies.map((methodology) => {
              const Icon = METHODOLOGY_ICONS[methodology.id] ?? FallbackIcon;

              return (
                <Card
                  key={methodology.id}
                  pressable
                  padding="none"
                  onClick={() => handleSelect(methodology.id)}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-4 p-4">
                    {/* Icon bubble */}
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: bg }}
                    >
                      <Icon size={22} color={color} />
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <h2 className="text-base font-bold text-gray-900">
                        {methodology.title}
                      </h2>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {methodology.description}
                      </p>
                    </div>

                    {/* Chevron */}
                    <div className="text-gray-300 shrink-0">
                      <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
                        <path
                          d="M1 1l6 6-6 6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Bottom accent */}
                  <div
                    className="h-0.5 w-full opacity-40"
                    style={{ backgroundColor: color }}
                  />
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Page>
  );
}
