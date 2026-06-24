import DashboardDonutChart from "@/components/dashboard/DashboardDonutChart";
import { Layers3 } from "lucide-react";
import type { DashboardSequencesByStatusItem } from "@/types/dashboard";

interface SequencesByStatusDonutChartProps {
  data: DashboardSequencesByStatusItem[];
}

export default function SequencesByStatusDonutChart({
  data,
}: SequencesByStatusDonutChartProps) {
  return (
    <DashboardDonutChart
      title="Sequences by Status"
      titleIcon={Layers3}
      description="Current status distribution across your sequences."
      emptyMessage="No sequence status data available yet."
      centerLabel="Total Sequences"
      valueLabel="Sequences"
      data={data.map((item) => ({
        label: item.status,
        count: item.count,
      }))}
    />
  );
}
