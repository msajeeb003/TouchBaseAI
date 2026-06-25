import { BarChart3, Loader2, TrendingUp } from "lucide-react";
import DeliveryStatsChart from "@/components/dashboard/DeliveryStatsChart";
import LeadsByStageDonutChart from "@/components/dashboard/LeadsByStageDonutChart";
import LeadsOverTimeAreaChart from "@/components/dashboard/LeadsOverTimeAreaChart";
import DashboardSummarySection from "@/components/dashboard/DashboardSummarySection";
import SequencesByStatusDonutChart from "@/components/dashboard/SequencesByStatusDonutChart";
import SentTrendLineChart from "@/components/dashboard/SentTrendLineChart";
import { useGetDashboardQuery } from "@/store/features/dashboard/dashboardApi";

export default function AnalyticsPage() {
  const { data, isLoading, isError } = useGetDashboardQuery();
  const dashboardData = data?.data;
  const summary = dashboardData?.summary;

  if (isLoading) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-sm text-slate-500">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
          <span>Loading analytics...</span>
        </div>
      </div>
    );
  }

  if (isError || !summary || !dashboardData) {
    return (
      <div className="rounded-xl border border-dashed border-red-200 bg-red-50 p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <TrendingUp className="h-5 w-5 text-red-600" />
        </div>
        <h3 className="text-2xl font-semibold text-red-900">Failed to load analytics.</h3>
        <p className="mx-auto mt-2 max-w-xl text-sm text-red-500">
          We could not fetch your analytics right now. Please try again in a moment.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="inline-flex items-center gap-2 text-3xl font-semibold text-slate-900">
          <BarChart3 className="h-7 w-7 text-indigo-600" />
          Analytics
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Performance across leads, sequences, and multi-channel outreach.
        </p>
      </div>

      <DashboardSummarySection summary={summary} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <SentTrendLineChart data={dashboardData.sentTrend} />
        <DeliveryStatsChart data={dashboardData.deliveryStats} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <LeadsByStageDonutChart data={dashboardData.leadsByStage} />
        <SequencesByStatusDonutChart data={dashboardData.sequencesByStatus} />
      </div>

      <LeadsOverTimeAreaChart data={dashboardData.leadsOverTime} />
    </div>
  );
}
