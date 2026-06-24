import {
  CartesianGrid,
  Line,
  LineChart,
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

export interface DashboardLineChartSeries {
  dataKey: string;
  label: string;
  color: string;
}

export interface DashboardLineChartDataPoint {
  label: string;
  [key: string]: string | number;
}

interface DashboardLineChartProps {
  title: string;
  titleIcon?: LucideIcon;
  description: string;
  emptyMessage: string;
  data: DashboardLineChartDataPoint[];
  series: DashboardLineChartSeries[];
  xAxisTickFormatter?: (value: string) => string;
  tooltipLabelFormatter?: (value: string) => string;
}

export default function DashboardLineChart({
  title,
  titleIcon: TitleIcon,
  description,
  emptyMessage,
  data,
  series,
  xAxisTickFormatter,
  tooltipLabelFormatter,
}: DashboardLineChartProps) {
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
          <LineChart
            data={data}
            margin={{ top: 12, right: 12, left: -12, bottom: 0 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="4 4" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              minTickGap={24}
              tickMargin={10}
              tickFormatter={(value) =>
                xAxisTickFormatter ? xAxisTickFormatter(String(value)) : String(value)
              }
            />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={36} />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(value) =>
                    tooltipLabelFormatter ? tooltipLabelFormatter(String(value)) : String(value)
                  }
                />
              }
            />
            <ChartLegend content={<ChartLegendContent />} />
            {series.map((item) => (
              <Line
                key={item.dataKey}
                type="monotone"
                dataKey={item.dataKey}
                stroke={`var(--color-${item.dataKey})`}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
