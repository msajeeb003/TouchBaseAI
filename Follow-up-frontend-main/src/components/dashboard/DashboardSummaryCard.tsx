import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const numberFormatter = new Intl.NumberFormat();

interface DashboardSummaryCardProps {
  title: string;
  value: number;
  description: string;
  icon: LucideIcon;
  iconClassName: string;
  valueClassName?: string;
  index?: number;
}

export default function DashboardSummaryCard({
  title,
  value,
  description,
  icon: Icon,
  iconClassName,
  valueClassName = "text-slate-900",
  index = 0,
}: DashboardSummaryCardProps) {
  return (
    <Card className="group overflow-hidden border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <CardContent className="relative p-5">
        <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-slate-100/50 blur-2xl transition-opacity duration-300 group-hover:opacity-90" />
        <div
          className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-105"
          style={{ animationDelay: `${index * 80}ms` }}
        >
          <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${iconClassName}`}>
            <Icon className="h-5 w-5" />
          </span>
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className={`text-3xl font-semibold tracking-tight ${valueClassName}`}>
            {numberFormatter.format(value)}
          </p>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
