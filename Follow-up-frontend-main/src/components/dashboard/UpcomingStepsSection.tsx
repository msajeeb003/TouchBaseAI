import { format, parseISO } from "date-fns";
import {
  CalendarClock,
  Clock3,
  Hash,
  Mail,
  MessageCircle,
  MessageSquareText,
  PhoneCall,
  UserRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { DashboardUpcomingStepItem } from "@/types/dashboard";

interface UpcomingStepsSectionProps {
  data: DashboardUpcomingStepItem[];
}

const formatDateTime = (value: string) => {
  try {
    return format(parseISO(value), "MMM d, yyyy • h:mm a");
  } catch {
    return value;
  }
};

const getStepTypeBadgeClass = (stepType: string) => {
  if (stepType === "EMAIL") return "border-indigo-200 bg-indigo-50 text-indigo-700";
  if (stepType === "SMS") return "border-amber-200 bg-amber-50 text-amber-700";
  if (stepType === "WHATSAPP") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (stepType === "CALL") return "border-amber-200 bg-amber-50 text-amber-800";
  return "border-slate-200 bg-slate-50 text-slate-700";
};

const getStepTypeIcon = (stepType: string) => {
  if (stepType === "EMAIL") return Mail;
  if (stepType === "SMS") return MessageSquareText;
  if (stepType === "WHATSAPP") return MessageCircle;
  if (stepType === "CALL") return PhoneCall;
  return MessageSquareText;
};

export default function UpcomingStepsSection({
  data,
}: UpcomingStepsSectionProps) {
  if (data.length === 0) {
    return (
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="inline-flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Clock3 className="h-5 w-5 text-indigo-600" />
            Upcoming Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 px-6 py-10 text-center text-sm text-slate-500">
            No upcoming steps scheduled yet.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="inline-flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Clock3 className="h-5 w-5 text-indigo-600" />
          Upcoming Activity
        </CardTitle>
        <p className="text-sm text-slate-500">
          Next scheduled sequence steps for your leads.
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-4 md:hidden">
          {data.map((step) => (
            <div
              key={step.id}
              className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-slate-900">
                    {step.subject || `${step.stepType} follow-up`}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">{step.sequenceName}</p>
                </div>
                <Badge
                  variant="outline"
                  className={getStepTypeBadgeClass(step.stepType)}
                >
                  <span className="inline-flex items-center gap-1.5">
                    {(() => {
                      const Icon = getStepTypeIcon(step.stepType);
                      return <Icon className="h-3.5 w-3.5" />;
                    })()}
                    {step.stepType}
                  </span>
                </Badge>
              </div>

              <div className="mt-4 grid gap-2 text-sm text-slate-600">
                <p className="inline-flex items-center gap-2">
                  <Hash className="h-4 w-4 text-slate-400" />
                  Step {step.stepOrder}
                </p>
                <p className="inline-flex items-center gap-2">
                  <UserRound className="h-4 w-4 text-slate-400" />
                  {step.leadName} • {step.leadEmail}
                </p>
                <p className="inline-flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-slate-400" />
                  {formatDateTime(step.scheduledAt)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Step</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Lead</TableHead>
                <TableHead>Sequence</TableHead>
                <TableHead>Scheduled At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((step) => (
                <TableRow key={step.id}>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getStepTypeBadgeClass(step.stepType)}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        {(() => {
                          const Icon = getStepTypeIcon(step.stepType);
                          return <Icon className="h-3.5 w-3.5" />;
                        })()}
                        {step.stepType}
                      </span>
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium text-slate-900">
                    Step {step.stepOrder}
                  </TableCell>
                  <TableCell className="max-w-[320px]">
                    <div className="truncate text-slate-700">
                      {step.subject || `${step.stepType} follow-up`}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900">{step.leadName}</span>
                      <span className="text-sm text-slate-500">{step.leadEmail}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-700">{step.sequenceName}</TableCell>
                  <TableCell className="text-slate-700">
                    {formatDateTime(step.scheduledAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
