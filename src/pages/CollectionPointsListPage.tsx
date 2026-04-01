import { useNavigate, useParams } from "react-router-dom";
import { MapPin, PlusCircle } from "lucide-react";
import { CollectionPointCard } from "@/components/collection-points/CollectionPointCard";
import { Page, EmptyState, Button } from "@/components/ui";
import { PageContent } from "@/components/shared/PageContent";
import { useCollectionPoints } from "@/hooks/useCollectionPoints";
import { useRecords } from "@/hooks/useRecords";
import { GROUP_LABELS, type FaunaGroup } from "@/lib/types";

export default function CollectionPointsListPage() {
  const { group } = useParams<{ group: string }>();
  const navigate = useNavigate();
  const { isLoading, filterCollectionPoints } = useCollectionPoints();
  const { records } = useRecords();

  const faunaGroup = group as FaunaGroup;
  const groupLabel = GROUP_LABELS[faunaGroup];
  const filteredPoints = groupLabel
    ? filterCollectionPoints({ group: faunaGroup })
    : [];

  const handleCreatePoint = () => {
    if (!groupLabel) return;
    navigate(`/methodologies/${faunaGroup}`);
  };

  const recordsByPoint = records.reduce<Record<string, number>>((acc, record) => {
    acc[record.collectionPointId] = (acc[record.collectionPointId] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <Page
      title={groupLabel ?? "Pontos de Coleta"}
      subtitle={
        groupLabel
          ? `${filteredPoints.length} ponto${filteredPoints.length !== 1 ? "s" : ""} de coleta`
          : "Grupo inválido"
      }
      back="/"
      footer={
        groupLabel ? (
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            icon={<PlusCircle size={20} />}
            onClick={handleCreatePoint}
          >
            Novo Ponto de Coleta
          </Button>
        ) : undefined
      }
    >
      <PageContent topPadding="md">
        {!groupLabel ? (
          <EmptyState
            icon={<MapPin size={48} />}
            title="Grupo não encontrado"
            description="Selecione Aves, Mamíferos ou Herpetofauna para visualizar os pontos registrados."
            action={
              <Button variant="secondary" size="sm" onClick={() => navigate("/")}>
                Voltar ao início
              </Button>
            }
          />
        ) : isLoading ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-sm text-gray-400">Carregando pontos...</p>
          </div>
        ) : filteredPoints.length === 0 ? (
          <EmptyState
            icon={<MapPin size={48} />}
            title="Nenhum ponto de coleta"
            description={`Crie o primeiro ponto de coleta de ${groupLabel} para começar a registrar observações.`}
            action={
              <Button variant="primary" size="sm" onClick={handleCreatePoint}>
                Novo Ponto de Coleta
              </Button>
            }
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
      </PageContent>
    </Page>
  );
}
