import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { SectionTitle } from "./SectionTitle";
import { Card } from "@/components/ui";
import { theme } from "@/lib/theme";

interface DataPoint {
  label: string;
  value: number;
}

interface BarChartSectionProps {
  title: string;
  data: DataPoint[];
}

export function BarChartSection({ title, data }: BarChartSectionProps) {
  return (
    <>
      <SectionTitle>{title}</SectionTitle>
      <Card padding="md">
        <ResponsiveContainer width="100%" height={160}>
          <BarChart
            data={data}
            margin={{ top: 4, right: 4, left: -24, bottom: 0 }}
          >
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: "#9ca3af" }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#9ca3af" }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #f3f4f6",
                fontSize: 12,
              }}
              cursor={{ fill: "#f3f4f6" }}
            />
            <Bar
              dataKey="value"
              name="Registros"
              fill={theme.colors.primary}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </>
  );
}
