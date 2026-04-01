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
  return (
    <DashboardSection title={title}>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="45%"
              outerRadius={70}
              label={({ label, percent }) =>
                `${label} (${(percent * 100).toFixed(0)}%)`
              }
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
              </span>
            </div>
          ))}
        </div>
    </DashboardSection>
  );
}
