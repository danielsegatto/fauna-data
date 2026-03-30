import { useNavigate } from "react-router-dom";
import { BarChart2 } from "lucide-react";
import { Page, Card, Button, Badge } from "@/components/ui";
import { InstallPrompt } from "@/components/ui/InstallPrompt";
import { useRecords } from "@/hooks/useRecords";
import { type FaunaGroup } from "@/lib/types";
import { theme } from "@/lib/theme";

// ─── Group card data ──────────────────────────────────────────────────────────

const GROUPS: Array<{
  id: FaunaGroup;
  label: string;
  description: string;
  icon: string;
}> = [
  {
    id: "birds",
    label: "Aves",
    description: "Aves silvestres",
    icon: "🦅",
  },
  {
    id: "mammals",
    label: "Mamíferos",
    description: "Mamíferos",
    icon: "🦝",
  },
  {
    id: "herpetofauna",
    label: "Herpetofauna",
    description: "Répteis e anfíbios",
    icon: "🦎",
  },
];

const groupColors = theme.groups;

// ─── Component ────────────────────────────────────────────────────────────────

export default function HomePage() {
  const navigate = useNavigate();
  const { records } = useRecords();

  const countByGroup = (group: FaunaGroup) =>
    records.filter((r) => r.group === group).length;

  const handleGroupSelect = (groupId: FaunaGroup) => {
    navigate(`/collection-points/${groupId}`);
  };

  return (
    <Page
      title="Fauna Data"
      subtitle="Monitoramento de fauna silvestre"
      className="pb-36"
      footer={
        <div className="flex flex-col gap-3">
          <InstallPrompt />
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            icon={<BarChart2 size={20} />}
            onClick={() => navigate("/dashboard")}
          >
            Painel de Análise
          </Button>
        </div>
      }
    >
      <div className="px-4 pt-5 pb-4 flex flex-col gap-4">
        {/* Total counter */}
        {records.length > 0 && (
          <div className="bg-primary/8 rounded-2xl px-4 py-3 flex items-center justify-between">
            <span className="text-sm font-medium text-primary">
              Total de registros
            </span>
            <span className="text-lg font-bold text-primary">{records.length}</span>
          </div>
        )}

        {/* Section label */}
        <p className="text-sm font-semibold text-gray-400 uppercase tracking-wide px-1">
          Selecione o grupo
        </p>

        {/* Group cards */}
        <div className="flex flex-col gap-3">
          {GROUPS.map(({ id, label, description, icon }) => {
            const { color, bg } = groupColors[id];
            const count = countByGroup(id);

            return (
              <Card
                key={id}
                pressable
                padding="none"
                onClick={() => handleGroupSelect(id)}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-4 p-4">
                  {/* Icon bubble */}
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 text-4xl"
                    style={{ backgroundColor: bg }}
                  >
                    {icon}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-gray-900">{label}</h2>
                      {count > 0 && (
                        <Badge variant="group" group={id}>
                          {count}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{description}</p>
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

                {/* Bottom accent bar */}
                <div
                  className="h-1 w-full opacity-60"
                  style={{ backgroundColor: color }}
                />
              </Card>
            );
          })}
        </div>
      </div>
    </Page>
  );
}
