import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { DashboardSection } from "./DashboardSection";

interface DataItem {
  label: string;
  value: number;
}

interface PieChartWithLegendProps {
  title: string;
  data: DataItem[];
  colors: readonly string[];
}

export function PieChartWithLegend({ title, data, colors }: PieChartWithLegendProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <DashboardSection title={title}>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              outerRadius={70}
              label={false}
              labelLine={false}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={colors[i % colors.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #f3f4f6",
                fontSize: 12,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap justify-center gap-3 mt-1">
          {data.map((item, i) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: colors[i % colors.length] }}
              />
              <span className="text-xs text-gray-600">
                {item.label}: <strong>{item.value}</strong>
                {total > 0 && (
                  <span className="text-gray-500"> ({Math.round((item.value / total) * 100)}%)</span>
                )}
              </span>
            </div>
          ))}
        </div>
    </DashboardSection>
  );
}
