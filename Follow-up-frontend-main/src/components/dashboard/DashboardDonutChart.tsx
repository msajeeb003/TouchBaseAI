import { Label, Pie, PieChart } from "recharts";
import type { LucideIcon } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface DashboardDonutChartItem {
  label: string;
  count: number;
}

interface DashboardDonutChartProps {
  title: string;
  titleIcon?: LucideIcon;
  description: string;
  emptyMessage: string;
  centerLabel: string;
  valueLabel: string;
  data: DashboardDonutChartItem[];
}

const getChartColor = (label: string) => {
  let hash = 0;

  for (let index = 0; index < label.length; index += 1) {
    hash = label.charCodeAt(index) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash) % 360;
  return `hsl(${hue} 78% 58%)`;
};

export default function DashboardDonutChart({
  title,
  titleIcon: TitleIcon,
  description,
  emptyMessage,
  centerLabel,
  valueLabel,
  data,
}: DashboardDonutChartProps) {
  const totalCount = data.reduce((sum, item) => sum + item.count, 0);
  const chartData = data.map((item) => ({
    ...item,
    fill: getChartColor(item.label),
    percent: totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0,
  }));

  if (chartData.length === 0) {
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

  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="inline-flex items-center gap-2 text-lg font-semibold text-slate-900">
          {TitleIcon ? <TitleIcon className="h-5 w-5 text-indigo-600" /> : null}
          {title}
        </CardTitle>
        <p className="text-sm text-slate-500">{description}</p>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="rounded-2xl border border-slate-200 bg-slate-50/40 p-3 sm:p-4">
          <ChartContainer
            config={{ count: { label: valueLabel } }}
            className="mx-auto aspect-square h-[240px] w-full max-w-[240px] sm:h-[280px] sm:max-w-[280px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    hideLabel
                    formatter={(value, _name, item) => {
                      const payload = item.payload as DashboardDonutChartItem & {
                        fill: string;
                        percent: number;
                      };

                      return (
                        <div className="grid min-w-[11rem] gap-1">
                          <span className="font-medium text-slate-900">{payload.label}</span>
                          <div className="flex items-center justify-between gap-4 text-slate-600">
                            <span>{valueLabel}</span>
                            <span className="font-medium text-slate-900">{value}</span>
                          </div>
                          <div className="flex items-center justify-between gap-4 text-slate-600">
                            <span>Percent</span>
                            <span className="font-medium text-slate-900">{payload.percent}%</span>
                          </div>
                        </div>
                      );
                    }}
                  />
                }
              />
              <Pie
                data={chartData}
                dataKey="count"
                nameKey="label"
                innerRadius={62}
                outerRadius={96}
                paddingAngle={3}
                strokeWidth={2}
              >
                <Label
                  content={({ viewBox }) => {
                    if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox)) {
                      return null;
                    }

                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy - 6}
                          className="fill-slate-900 text-2xl font-semibold"
                        >
                          {totalCount}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy + 18}
                          className="fill-slate-500 text-xs"
                        >
                          {centerLabel}
                        </tspan>
                      </text>
                    );
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          {chartData.map((item) => (
            <div
              key={`${item.label}-${item.count}`}
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-600"
            >
              <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: item.fill }} />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
