import { format, parseISO } from "date-fns";
import DashboardAreaChart from "@/components/dashboard/DashboardAreaChart";
import type { DashboardLeadsOverTimeItem } from "@/types/dashboard";

interface LeadsOverTimeAreaChartProps {
  data: DashboardLeadsOverTimeItem[];
}

const formatDateLabel = (value: string) => {
  try {
    return format(parseISO(value), "MMM d");
  } catch {
    return value;
  }
};

export default function LeadsOverTimeAreaChart({
  data,
}: LeadsOverTimeAreaChartProps) {
  return (
    <DashboardAreaChart
      title="New Leads Trend"
      description="How many new leads were added over the last 30 days."
      emptyMessage="No lead trend data available yet."
      data={data.map((item) => ({
        label: item.date,
        leads: item.count,
      }))}
      series={[
        {
          dataKey: "leads",
          label: "New Leads",
          color: "#4f46e5",
        },
      ]}
      xAxisTickFormatter={formatDateLabel}
      tooltipLabelFormatter={formatDateLabel}
    />
  );
}
