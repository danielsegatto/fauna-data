import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";
import { CollectionPointCard } from "@/components/collection-points/CollectionPointCard";
import { FilterTabs } from "@/components/shared/FilterTabs";
import { Page, EmptyState } from "@/components/ui";
import { useCollectionPoints } from "@/hooks/useCollectionPoints";
import { useRecords } from "@/hooks/useRecords";
import { type FaunaGroup } from "@/lib/types";

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
        <FilterTabs
          tabs={FILTER_TABS}
          activeTab={activeFilter}
          onChange={setActiveFilter}
          getCount={(tabId) =>
            tabId === "all"
              ? collectionPoints.length
              : collectionPoints.filter((point) => point.group === tabId).length
          }
        />

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
