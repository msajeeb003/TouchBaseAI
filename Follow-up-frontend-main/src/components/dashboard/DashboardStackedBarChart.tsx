import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import type { LucideIcon } from "lucide-react";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface DashboardStackedBarSeries {
  dataKey: string;
  label: string;
  color: string;
  stackId?: string;
}

export interface DashboardStackedBarDataPoint {
  label: string;
  [key: string]: string | number;
}

interface DashboardStackedBarChartProps {
  title: string;
  titleIcon?: LucideIcon;
  description: string;
  emptyMessage: string;
  data: DashboardStackedBarDataPoint[];
  series: DashboardStackedBarSeries[];
}

export default function DashboardStackedBarChart({
  title,
  titleIcon: TitleIcon,
  description,
  emptyMessage,
  data,
  series,
}: DashboardStackedBarChartProps) {
  if (data.length === 0 || series.length === 0) {
    return (
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="inline-flex items-center gap-2 text-lg font-semibold text-slate-900">
            {TitleIcon ? <TitleIcon className="h-5 w-5 text-indigo-600" /> : null}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 px-6 py-10 text-center text-sm text-slate-500">
            {emptyMessage}
          </div>
        </CardContent>
      </Card>
    );
  }

  const config = series.reduce<ChartConfig>((acc, item) => {
    acc[item.dataKey] = {
      label: item.label,
      color: item.color,
    };

    return acc;
  }, {});

  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="inline-flex items-center gap-2 text-lg font-semibold text-slate-900">
          {TitleIcon ? <TitleIcon className="h-5 w-5 text-indigo-600" /> : null}
          {title}
        </CardTitle>
        <p className="text-sm text-slate-500">{description}</p>
      </CardHeader>

      <CardContent className="space-y-4">
        <ChartContainer config={config} className="h-[280px] w-full">
          <BarChart data={data} margin={{ top: 12, right: 12, left: -12, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="4 4" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
            />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={36} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            {series.map((item) => (
              <Bar
                key={item.dataKey}
                dataKey={item.dataKey}
                stackId={item.stackId}
                fill={`var(--color-${item.dataKey})`}
                radius={[6, 6, 0, 0]}
              />
            ))}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
