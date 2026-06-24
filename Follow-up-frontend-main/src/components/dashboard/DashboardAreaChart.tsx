import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface DashboardAreaChartSeries {
  dataKey: string;
  label: string;
  color: string;
}

export interface DashboardAreaChartDataPoint {
  label: string;
  [key: string]: string | number;
}

interface DashboardAreaChartProps {
  title: string;
  description: string;
  emptyMessage: string;
  data: DashboardAreaChartDataPoint[];
  series: DashboardAreaChartSeries[];
  xAxisTickFormatter?: (value: string) => string;
  tooltipLabelFormatter?: (value: string) => string;
}

export default function DashboardAreaChart({
  title,
  description,
  emptyMessage,
  data,
  series,
  xAxisTickFormatter,
  tooltipLabelFormatter,
}: DashboardAreaChartProps) {
  if (data.length === 0 || series.length === 0) {
    return (
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-slate-900">{title}</CardTitle>
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
        <CardTitle className="text-lg font-semibold text-slate-900">{title}</CardTitle>
        <p className="text-sm text-slate-500">{description}</p>
      </CardHeader>

      <CardContent className="space-y-4">
        <ChartContainer config={config} className="h-[300px] w-full">
          <AreaChart data={data} margin={{ top: 12, right: 12, left: -12, bottom: 0 }}>
            <defs>
              {series.map((item) => (
                <linearGradient
                  key={item.dataKey}
                  id={`fill-${item.dataKey}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={`var(--color-${item.dataKey})`}
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="95%"
                    stopColor={`var(--color-${item.dataKey})`}
                    stopOpacity={0.04}
                  />
                </linearGradient>
              ))}
            </defs>
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
            {series.map((item) => (
              <Area
                key={item.dataKey}
                type="monotone"
                dataKey={item.dataKey}
                stroke={`var(--color-${item.dataKey})`}
                fill={`url(#fill-${item.dataKey})`}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5 }}
              />
            ))}
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
