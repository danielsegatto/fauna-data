import { HBar } from "./HBar";
import { DashboardSection } from "./DashboardSection";

interface BarData {
  label: string;
  value: number;
  name?: string;
  count?: number;
  rank?: number;
}

interface HBarChartSectionProps {
  title: string;
  data: BarData[];
  colors: readonly string[];
  singleColor?: boolean;
}

export function HBarChartSection({
  title,
  data,
  colors,
  singleColor = false,
}: HBarChartSectionProps) {
  const maxValue = data.length > 0 ? data[0].value : 0;

  return (
    <DashboardSection title={title}>
        <div className="flex flex-col gap-3">
          {data.map((item, i) => (
            <HBar
              key={item.label}
              label={item.label}
              value={item.value}
              max={maxValue}
              color={singleColor ? colors[0] : colors[i % colors.length]}
              rank={item.rank}
            />
          ))}
        </div>
    </DashboardSection>
  );
}
