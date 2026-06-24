import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronRight,
  Loader2,
  Mail,
  MessageCircle,
  MessageSquare,
  PhoneCall,
  Pencil,
  RefreshCw,
  Trash2,
  Wand2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import AddSequenceDialog from "@/components/sequences/AddSequenceDialog";
import UpdateSequenceDialog from "@/components/sequences/UpdateSequenceDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useDeleteSequenceMutation,
  useGenerateSequenceStepsMutation,
  useGetSequencesQuery,
  useUpdateSequenceMutation,
} from "@/store/features/sequences/sequencesApi";
import type { SequenceCountInfo, SequenceStatus } from "@/types/sequences";
import { cn } from "@/lib/utils";
import { dismissToast, showError, showLoading, showSuccess } from "@/utils/toast";

const VALID_STATUSES: SequenceStatus[] = ["draft", "active", "paused", "completed", "cancelled"];

const getStatusBadgeClass = (status: SequenceStatus) => {
  if (status === "active") return "border-green-200 bg-green-100 text-green-700";
  if (status === "draft") return "border-amber-200 bg-amber-100 text-amber-700";
  if (status === "completed") return "border-emerald-200 bg-emerald-100 text-emerald-700";
  if (status === "cancelled") return "border-rose-200 bg-rose-100 text-rose-700";
  if (status === "paused") return "border-blue-200 bg-blue-100 text-blue-700";
  return "border-slate-200 bg-slate-100 text-slate-700";
};

const getStatusLabel = (status: SequenceStatus) => status.charAt(0).toUpperCase() + status.slice(1);

const clampProgress = (value: number) => Math.max(0, Math.min(100, value));

const EMPTY_SEQUENCE_COUNTS: SequenceCountInfo = {
  steps: 0,
  emailSteps: 0,
  smsSteps: 0,
  whatsappSteps: 0,
  callSteps: 0,
  emailSent: 0,
  smsSent: 0,
  whatsappSent: 0,
  callSent: 0,
};

const toNonNegative = (value: number | undefined) => Math.max(value ?? 0, 0);

const buildProgressMetrics = (counts: SequenceCountInfo) => {
  const emailTotal = toNonNegative(counts?.emailSteps);
  const smsTotal = toNonNegative(counts?.smsSteps);
  const whatsappTotal = toNonNegative(counts?.whatsappSteps);
  const callTotal = toNonNegative(counts?.callSteps);

  const emailSent = Math.min(toNonNegative(counts?.emailSent), emailTotal);
  const smsSent = Math.min(toNonNegative(counts?.smsSent), smsTotal);
  const whatsappSent = Math.min(toNonNegative(counts?.whatsappSent), whatsappTotal);
  const callSent = Math.min(toNonNegative(counts?.callSent), callTotal);

  const totalForProgress = emailTotal + smsTotal + whatsappTotal + callTotal;
  const sentCount = Math.min(emailSent + smsSent + whatsappSent + callSent, totalForProgress);
  const progressValue = clampProgress((sentCount / Math.max(totalForProgress, 1)) * 100);

  const channels = [
    {
      key: "email",
      total: emailTotal,
      sent: emailSent,
      icon: Mail,
      className: "bg-indigo-50 text-indigo-700",
    },
    {
      key: "sms",
      total: smsTotal,
      sent: smsSent,
      icon: MessageSquare,
      className: "bg-violet-50 text-violet-700",
    },
    {
      key: "whatsapp",
      total: whatsappTotal,
      sent: whatsappSent,
      icon: MessageCircle,
      className: "bg-emerald-50 text-emerald-700",
    },
    {
      key: "call",
      total: callTotal,
      sent: callSent,
      icon: PhoneCall,
      className: "bg-amber-50 text-amber-700",
    },
  ].filter((channel) => channel.total > 0);

  return { sentCount, totalForProgress, progressValue, channels };
};

export default function SequencesPage() {
  const [stageFilter, setStageFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [deletingSequenceId, setDeletingSequenceId] = useState<string | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [generatingStepsId, setGeneratingStepsId] = useState<string | null>(null);
  const { data, isLoading, isError } = useGetSequencesQuery();
  const [deleteSequence] = useDeleteSequenceMutation();
  const [updateSequence] = useUpdateSequenceMutation();
  const [generateSequenceSteps] = useGenerateSequenceStepsMutation();
  const sequences = useMemo(() => data?.data ?? [], [data?.data]);

  const stageOptions = useMemo(() => {
    const uniqueStages = Array.from(
      new Set(sequences.map((item) => item.promptTemplate?.followUpStage).filter(Boolean)),
    );
    return ["All", ...uniqueStages];
  }, [sequences]);

  const filteredSequences = useMemo(
    () =>
      sequences.filter((item) => {
        const matchesStage =
          stageFilter === "All" || item.promptTemplate?.followUpStage === stageFilter;
        const matchesStatus = statusFilter === "All" || item.status === statusFilter;
        return matchesStage && matchesStatus;
      }),
    [sequences, stageFilter, statusFilter],
  );

  const handleDeleteSequence = async (sequenceId: string) => {
    const loadingToastId = showLoading("Deleting sequence...");
    setDeletingSequenceId(sequenceId);

    try {
      const response = await deleteSequence(sequenceId).unwrap();
      showSuccess(response.message || "Sequence deleted successfully");
    } catch (error: unknown) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        "Failed to delete sequence. Please try again.";
      showError(errorMessage);
    } finally {
      dismissToast(loadingToastId);
      setDeletingSequenceId(null);
    }
  };

  const handleStatusUpdate = async (sequenceId: string, status: SequenceStatus) => {
    const sequence = sequences.find((item) => item.id === sequenceId);
    if (!sequence || sequence.status === status || sequence.status === "completed" || status === "completed") {
      return;
    }

    const loadingToastId = showLoading("Updating sequence status...");
    setUpdatingStatusId(sequenceId);

    try {
      const response = await updateSequence({
        id: sequenceId,
        body: {
          leadId: sequence.leadId,
          name: sequence.name,
          totalSteps: sequence.totalSteps,
          promptTemplateId: sequence.promptTemplateId,
          status,
        },
      }).unwrap();
      showSuccess(response.message || "Sequence updated successfully");
    } catch (error: unknown) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        "Failed to update sequence status. Please try again.";
      showError(errorMessage);
    } finally {
      dismissToast(loadingToastId);
      setUpdatingStatusId(null);
    }
  };

  const handleGenerateSteps = async (sequenceId: string) => {
    const loadingToastId = showLoading("Generating steps and content...");
    setGeneratingStepsId(sequenceId);

    try {
      const response = await generateSequenceSteps(sequenceId).unwrap();
      showSuccess(response.message || "Steps and content generated successfully");
    } catch (error: unknown) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        "Failed to generate steps and content. Please try again.";
      showError(errorMessage);
    } finally {
      dismissToast(loadingToastId);
      setGeneratingStepsId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-sm text-slate-500">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
          <span>Loading sequences...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-sm text-red-600">
        Failed to fetch sequences.
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 space-y-4 overflow-x-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          {/* <p className="text-sm text-slate-500">Follow Up Dashboard</p> */}
          <h2 className="flex items-center gap-2 text-3xl font-semibold text-slate-900">
            <RefreshCw className="h-6 w-6 text-indigo-500" />
            Sequences
          </h2>
        </div>
        <AddSequenceDialog
          onSequenceCreated={handleGenerateSteps}
          trigger={
            <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700">
              <Wand2 className="h-4 w-4" />
              Generate Sequence
            </Button>
          }
        />
      </div>

      <div className="w-full min-w-0 rounded-xl border bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-3 border-b p-4">
          <div className="w-full sm:w-[140px]">
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter: All" />
              </SelectTrigger>
              <SelectContent>
                {stageOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option === "All" ? "Filter: All" : option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-[140px]">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status: All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">Status: All</SelectItem>
                {VALID_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {getStatusLabel(status)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredSequences.length === 0 ? (
          <div className="p-8 text-center">
            <h3 className="text-lg font-semibold text-slate-900">No sequences found</h3>
            <p className="mt-1 text-sm text-slate-500">Try changing the filters to see available sequences.</p>
          </div>
        ) : (
          <div className="w-full max-w-full overflow-x-auto">
            <Table className="min-w-[1320px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Lead</TableHead>
                  <TableHead>Template</TableHead>
                  <TableHead>Steps</TableHead>
                  <TableHead className="min-w-[200px]">Progress</TableHead>
                  <TableHead className="text-center">Step Details</TableHead>
                  <TableHead className="text-center">Generate Steps & Content</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center min-w-[140px]">Active</TableHead>
                  <TableHead className="text-center">Edit</TableHead>
                  <TableHead className="text-center">Delete</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSequences.map((sequence) => (
                  <TableRow key={sequence.id}>
                    <TableCell className="font-medium text-slate-900">{sequence.name}</TableCell>
                    <TableCell className="text-slate-600">{sequence.lead?.name || "N/A"}</TableCell>
                    <TableCell className="text-slate-600">
                      {sequence.promptTemplate?.followUpStage || sequence.promptTemplate?.name || "N/A"}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {sequence._count?.steps ?? 0}/{sequence.totalSteps}
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const { sentCount, totalForProgress, progressValue, channels } =
                          buildProgressMetrics(sequence._count ?? EMPTY_SEQUENCE_COUNTS);

                        return (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs text-slate-600">
                              <span>{sentCount}/{totalForProgress} sent</span>
                              <span>{Math.round(progressValue)}%</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-indigo-100">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-indigo-300 via-indigo-500 to-indigo-700 transition-all duration-500"
                                style={{ width: `${progressValue}%` }}
                              />
                            </div>
                            {channels.length > 0 && (
                              <div className="flex items-center gap-2 text-[11px] text-slate-600">
                                {channels.map((channel) => {
                                  const Icon = channel.icon;
                                  return (
                                    <span
                                      key={channel.key}
                                      className={cn(
                                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5",
                                        channel.className,
                                      )}
                                    >
                                      <Icon className="h-3 w-3" />
                                      {channel.sent}/{channel.total}
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button asChild variant="ghost" className="gap-1 text-indigo-600 hover:text-indigo-700">
                        <Link to={`/dashboard/sequences/${sequence.id}/steps`}>
                          View
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                    <TableCell className="text-center">
                      <button
                        type="button"
                        title="Use AI to generate steps and content. To regenerate, delete all existing steps first."
                        disabled={generatingStepsId === sequence.id}
                        onClick={() => void handleGenerateSteps(sequence.id)}
                        className={cn(
                          "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 via-fuchsia-500 to-amber-400 text-white shadow-md shadow-violet-500/35 ring-2 ring-violet-200/80 transition-transform hover:scale-105 hover:from-violet-600 hover:via-fuchsia-600 hover:to-amber-500 hover:shadow-lg hover:shadow-fuchsia-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 disabled:hover:scale-100",
                        )}
                      >
                        {generatingStepsId === sequence.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                        ) : (
                          <Wand2 className="h-4 w-4 drop-shadow-sm" strokeWidth={2.25} aria-hidden />
                        )}
                        <span className="sr-only">Use AI to generate steps and content. To regenerate, delete all existing steps first.</span>
                      </button>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={sequence.status}
                        onValueChange={(value) =>
                          handleStatusUpdate(sequence.id, value as SequenceStatus)
                        }
                        disabled={updatingStatusId === sequence.id || sequence.status === "completed"}
                      >
                        <SelectTrigger className={`h-9 w-[150px] ${getStatusBadgeClass(sequence.status)}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {VALID_STATUSES.map((status) => (
                            <SelectItem
                              key={status}
                              value={status}
                              disabled={status === "completed"}
                            >
                              {getStatusLabel(status)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-center">
                      <div
                        className="flex items-center justify-center gap-2"
                        title={sequence.status === "completed" ? "Completed sequences cannot be toggled" : undefined}
                      >
                        <span
                          className={cn(
                            "text-xs",
                            sequence.status === "active"
                              ? "text-muted-foreground"
                              : "font-medium text-slate-700",
                          )}
                        >
                          Paused
                        </span>
                        <Switch
                          className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-slate-300"
                          checked={sequence.status === "active"}
                          disabled={
                            updatingStatusId === sequence.id || sequence.status === "completed"
                          }
                          aria-label={
                            sequence.status === "active"
                              ? "Pause sequence"
                              : "Activate sequence"
                          }
                          onCheckedChange={(checked) =>
                            void handleStatusUpdate(
                              sequence.id,
                              checked ? "active" : "paused",
                            )
                          }
                        />
                        <span
                          className={cn(
                            "text-xs",
                            sequence.status === "active"
                              ? "font-medium text-green-600"
                              : "text-muted-foreground",
                          )}
                        >
                          Start
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <UpdateSequenceDialog
                        sequenceId={sequence.id}
                        trigger={
                          <Button variant="ghost" size="icon" className="text-indigo-600 hover:text-indigo-700">
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Update sequence</span>
                          </Button>
                        }
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-rose-600 hover:text-rose-700"
                            disabled={deletingSequenceId === sequence.id}
                          >
                            {deletingSequenceId === sequence.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                            <span className="sr-only">Delete sequence</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete sequence?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete{" "}
                              <span className="font-medium text-foreground">{sequence.name}</span>.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-rose-600 text-white hover:bg-rose-700"
                              onClick={() => handleDeleteSequence(sequence.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
