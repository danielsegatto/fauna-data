import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPinned } from "lucide-react";
import { FilterTabs } from "@/components/shared/FilterTabs";
import { PageContent } from "@/components/shared/PageContent";
import { RecordsMap } from "@/components/shared/RecordsMap";
import { EmptyState, Page } from "@/components/ui";
import { useCollectionPoints } from "@/hooks/useCollectionPoints";
import { useRecords } from "@/hooks/useRecords";
import { buildRecordMapPins } from "@/lib/recordMap";
import { GROUP_LABELS, type FaunaGroup } from "@/lib/types";

type MapRange = "all" | "7days" | "30days";
type GroupFilter = FaunaGroup | "all";

const RANGE_TABS: Array<{ id: MapRange; label: string }> = [
  { id: "all", label: "Todos" },
  { id: "7days", label: "7 dias" },
  { id: "30days", label: "30 dias" },
];

const GROUP_TABS: Array<{ id: GroupFilter; label: string }> = [
  { id: "all", label: "Todos" },
  { id: "birds", label: GROUP_LABELS.birds },
  { id: "mammals", label: GROUP_LABELS.mammals },
  { id: "herpetofauna", label: GROUP_LABELS.herpetofauna },
];

function getRangeStart(range: MapRange): number | undefined {
  const now = Date.now();
  if (range === "7days") return now - 7 * 24 * 60 * 60 * 1000;
  if (range === "30days") return now - 30 * 24 * 60 * 60 * 1000;
  return undefined;
}

export default function RecordsMapPage() {
  const navigate = useNavigate();
  const { records } = useRecords();
  const { collectionPoints } = useCollectionPoints();

  const [group, setGroup] = useState<GroupFilter>("all");
  const [range, setRange] = useState<MapRange>("all");

  const startDate = getRangeStart(range);

  const rangeScoped = useMemo(
    () => buildRecordMapPins(records, collectionPoints, { startDate }),
    [records, collectionPoints, startDate]
  );

  const visible = useMemo(
    () => buildRecordMapPins(records, collectionPoints, { group, startDate }),
    [records, collectionPoints, group, startDate]
  );

  const countByGroup = useMemo(() => {
    return rangeScoped.pins.reduce<Record<GroupFilter, number>>(
      (acc, pin) => {
        acc[pin.group] += 1;
        acc.all += 1;
        return acc;
      },
      {
        all: 0,
        birds: 0,
        mammals: 0,
        herpetofauna: 0,
      }
    );
  }, [rangeScoped.pins]);

  return (
    <Page title="Mapa de Registros" subtitle="Visualização limpa por satélite" back="/">
      <PageContent topPadding="md" className="pb-6 flex flex-col gap-3">
        <FilterTabs
          tabs={GROUP_TABS}
          activeTab={group}
          onChange={setGroup}
          getCount={(tabId) => countByGroup[tabId]}
        />

        <FilterTabs
          tabs={RANGE_TABS}
          activeTab={range}
          onChange={setRange}
          getCount={() => 0}
          fullWidth
        />

        {visible.totalRecords === 0 ? (
          <EmptyState
            icon={<MapPinned size={48} />}
            title="Nenhum registro no filtro"
            description="Ajuste os filtros para visualizar observações no mapa."
          />
        ) : visible.mappableRecords === 0 ? (
          <EmptyState
            icon={<MapPinned size={48} />}
            title="Sem coordenadas para mapear"
            description="Os registros encontrados não possuem coordenadas no ponto de coleta."
          />
        ) : (
          <RecordsMap
            pins={visible.pins}
            collectionPointPins={visible.collectionPointPins}
            onOpenRecord={(recordId) => {
              navigate(`/records/${recordId}`, { state: { backTo: "/map" } });
            }}
            onOpenCollectionPoint={(pointId) => {
              navigate(`/collection-point/${pointId}`);
            }}
          />
        )}
      </PageContent>
    </Page>
  );
}
