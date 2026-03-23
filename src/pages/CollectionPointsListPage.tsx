import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, ChevronRight } from "lucide-react";
import { Page, Card, Badge, EmptyState } from "@/components/ui";
import { useCollectionPoints } from "@/hooks/useCollectionPoints";
import { useRecords } from "@/hooks/useRecords";
import {
  GROUP_LABELS,
  METHODOLOGY_LABELS,
  type FaunaGroup,
  type CollectionPoint,
} from "@/lib/types";
import { formatDateTime } from "@/lib/theme";

const FILTER_TABS: Array<{ id: FaunaGroup | "all"; label: string }> = [
  { id: "all", label: "Todos" },
  { id: "birds", label: "Aves" },
  { id: "mammals", label: "Mamíferos" },
  { id: "herpetofauna", label: "Herpetofauna" },
];

export default function CollectionPointsListPage() {
  const navigate = useNavigate();
  const { collectionPoints, isLoading } = useCollectionPoints();
  const { records } = useRecords();

  const [activeFilter, setActiveFilter] = useState<FaunaGroup | "all">("all");

  const filteredPoints = collectionPoints.filter((point) => {
    if (activeFilter === "all") return true;
    return point.group === activeFilter;
  });

  const recordsByPoint = records.reduce<Record<string, number>>((acc, record) => {
    acc[record.collectionPointId] = (acc[record.collectionPointId] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <Page
      title="Pontos de Coleta"
      subtitle={`${filteredPoints.length} ponto${filteredPoints.length !== 1 ? "s" : ""}`}
      back="/"
    >
      <div className="px-4 pt-4 pb-4 flex flex-col gap-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {FILTER_TABS.map((tab: (typeof FILTER_TABS)[number]) => {
            const isActive = activeFilter === tab.id;
            const count =
              tab.id === "all"
                ? collectionPoints.length
                : collectionPoints.filter((point) => point.group === tab.id).length;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`
                  flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold
                  whitespace-nowrap transition-all duration-150 active:scale-95 shrink-0
                  ${
                    isActive
                      ? "bg-primary text-white"
                      : "bg-white border border-gray-200 text-gray-600"
                  }
                `}
              >
                {tab.label}
                {count > 0 && (
                  <span
                    className={`text-xs rounded-full px-1.5 py-0.5 font-bold ${
                      isActive ? "bg-white/25 text-white" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-sm text-gray-400">Carregando pontos...</p>
          </div>
        ) : filteredPoints.length === 0 ? (
          <EmptyState
            icon={<MapPin size={48} />}
            title="Nenhum ponto de coleta"
            description="Crie um ponto para começar a registrar observações."
          />
        ) : (
          <div className="flex flex-col gap-3">
            {filteredPoints.map((point) => (
              <CollectionPointCard
                key={point.id}
                point={point}
                recordsCount={recordsByPoint[point.id] ?? 0}
                onOpen={() => navigate(`/collection-point/${point.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </Page>
  );
}

function CollectionPointCard({
  point,
  recordsCount,
  onOpen,
}: {
  point: CollectionPoint;
  recordsCount: number;
  onOpen: () => void;
}) {
  return (
    <Card pressable padding="none" onClick={onOpen} className="overflow-hidden">
      <div className="p-4 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-base font-bold text-gray-900 truncate">{point.name}</p>
            <Badge variant="group" group={point.group}>
              {GROUP_LABELS[point.group]}
            </Badge>
          </div>
          <p className="text-sm text-gray-500 truncate">
            {METHODOLOGY_LABELS[point.methodology] ?? point.methodology}
          </p>
          <p className="text-xs text-gray-400 mt-1">{formatDateTime(point.createdAt)}</p>
          <p className="text-xs text-gray-500 mt-2">
            {recordsCount} registro{recordsCount !== 1 ? "s" : ""} associado{recordsCount !== 1 ? "s" : ""}
          </p>
        </div>
        <ChevronRight size={18} className="text-gray-300 shrink-0 mt-1" />
      </div>
    </Card>
  );
}
