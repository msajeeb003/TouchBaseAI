import { useState } from "react";
import {
  Loader2, Plus, RefreshCw, Sparkles, Trash2, Mail,
  MessageCircle,
  MessageSquare,
  PhoneCall,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import AddStepDialog from "@/components/sequences/AddStepDialog";
import SequenceStepEditor from "@/components/sequences/SequenceStepEditor";
import {
  useDeleteAllSequenceStepsMutation,
  useDeleteSequenceStepMutation,
  useGenerateSequenceStepContentMutation,
  useGetSequenceStepsQuery,
  useGetSingleSequenceQuery,
  useRegenerateAllStepContentMutation,
} from "@/store/features/sequences/sequencesApi";
import { dismissToast, showError, showLoading, showSuccess } from "@/utils/toast";




const formatDateTime = (value: string | null | undefined) => {
  if (!value) return "N/A";
  return new Date(value).toLocaleString();
};

const getStepStatusBadgeClass = (status: string) => {
  const value = status.toLowerCase();
  if (value === "sent") return "border-emerald-200 bg-emerald-100 text-emerald-700";
  if (value === "pending") return "border-amber-200 bg-amber-100 text-amber-700";
  if (value === "skipped") return "border-slate-200 bg-slate-100 text-slate-700";
  if (value === "failed") return "border-rose-200 bg-rose-100 text-rose-700";
  return "border-blue-200 bg-blue-100 text-blue-700";
};

export default function SequenceStepsPage() {
  const { id } = useParams<{ id: string }>();
  const [deletingStepId, setDeletingStepId] = useState<string | null>(null);
  const [generatingStepId, setGeneratingStepId] = useState<string | null>(null);
  const [isRegeneratingAll, setIsRegeneratingAll] = useState(false);
  const [isDeletingAllSteps, setIsDeletingAllSteps] = useState(false);
  const {
    data: sequenceData,
    isLoading: isSequenceLoading,
    isError: isSequenceError,
  } = useGetSingleSequenceQuery(id ?? "", {
    skip: !id,
  });
  const {
    data: stepsData,
    isLoading: isStepsLoading,
    isError: isStepsError,
  } = useGetSequenceStepsQuery(id ?? "", {
    skip: !id,
  });
  const [deleteSequenceStep] = useDeleteSequenceStepMutation();
  const [generateSequenceStepContent] = useGenerateSequenceStepContentMutation();
  const [regenerateAllStepContent] = useRegenerateAllStepContentMutation();
  const [deleteAllSequenceSteps] = useDeleteAllSequenceStepsMutation();

  const sequence = sequenceData?.data;
  const steps = stepsData?.data ?? [];
  const nextStepOrder = steps.length + 1;
  const hasCompletedAllSteps = Boolean(sequence && steps.length >= sequence.totalSteps);
  const canRegenerateAllContent = Boolean(
    sequence && sequence.totalSteps > 0 && steps.length === sequence.totalSteps,
  );
  const canDeleteAllSteps = steps.length > 0;

  const handleDeleteStep = async (stepId: string) => {
    if (!id) return;

    const loadingToastId = showLoading("Deleting step...");
    setDeletingStepId(stepId);

    try {
      const response = await deleteSequenceStep({ sequenceId: id, stepId }).unwrap();
      showSuccess(response.message || "Step deleted successfully");
    } catch (error: unknown) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        "Failed to delete step. Please try again.";
      showError(errorMessage);
    } finally {
      dismissToast(loadingToastId);
      setDeletingStepId(null);
    }
  };

  const handleGenerateContent = async (stepId: string) => {
    if (!id) return;

    const loadingToastId = showLoading("Generating content...");
    setGeneratingStepId(stepId);

    try {
      const response = await generateSequenceStepContent({ sequenceId: id, stepId }).unwrap();
      showSuccess(response.message || "Content generated successfully");
    } catch (error: unknown) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        "Failed to generate content. Please try again.";
      showError(errorMessage);
    } finally {
      dismissToast(loadingToastId);
      setGeneratingStepId(null);
    }
  };

  const handleRegenerateAllContent = async () => {
    if (!id || !canRegenerateAllContent) return;

    const loadingToastId = showLoading("Regenerating all step content...");
    setIsRegeneratingAll(true);

    try {
      const response = await regenerateAllStepContent(id).unwrap();
      showSuccess(response.message || "Bulk step content regeneration finished");
    } catch (error: unknown) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        "Failed to regenerate step content. Please try again.";
      showError(errorMessage);
    } finally {
      dismissToast(loadingToastId);
      setIsRegeneratingAll(false);
    }
  };

  const handleDeleteAllSteps = async () => {
    if (!id || !canDeleteAllSteps) return;

    const loadingToastId = showLoading("Deleting all steps...");
    setIsDeletingAllSteps(true);

    try {
      const response = await deleteAllSequenceSteps(id).unwrap();
      showSuccess(response.message || `Deleted ${response.data.deletedCount} step(s)`);
    } catch (error: unknown) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        "Failed to delete steps. Please try again.";
      showError(errorMessage);
    } finally {
      dismissToast(loadingToastId);
      setIsDeletingAllSteps(false);
    }
  };

  if (isSequenceLoading || isStepsLoading) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-sm text-slate-500">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
          <span>Loading sequence steps...</span>
        </div>
      </div>
    );
  }

  if (isSequenceError || isStepsError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-sm text-red-600">
        Failed to fetch sequence steps.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-3xl font-semibold text-slate-900">
              {sequence?.name || "Sequence Steps"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Lead: {sequence?.lead?.name || "N/A"} | Template:{" "}
              {sequence?.promptTemplate?.name || "N/A"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2 border-rose-200 text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={!canDeleteAllSteps || isDeletingAllSteps}
                >
                  {isDeletingAllSteps ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    <Trash2 className="h-4 w-4" aria-hidden />
                  )}
                  Delete all steps
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete all steps?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This removes every step in this sequence ({steps.length} total). You can create
                    steps again afterward. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-rose-600 text-white hover:bg-rose-700"
                    onClick={() => void handleDeleteAllSteps()}
                  >
                    Delete all
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button
              type="button"
              variant="outline"
              className="gap-2 border-violet-200 bg-gradient-to-r from-violet-50 to-fuchsia-50 text-violet-900 hover:from-violet-100 hover:to-fuchsia-100 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!canRegenerateAllContent || isRegeneratingAll}
              title={
                canRegenerateAllContent
                  ? "Regenerate AI content for every step"
                  : "Available once all steps exist for this sequence"
              }
              onClick={() => void handleRegenerateAllContent()}
            >
              {isRegeneratingAll ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <RefreshCw className="h-4 w-4 text-violet-600" aria-hidden />
              )}
              Regenerate all content
            </Button>
            <AddStepDialog
              sequenceId={id ?? ""}
              nextStepOrder={nextStepOrder}
              disabled={hasCompletedAllSteps}
              trigger={
                <Button
                  className="gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={hasCompletedAllSteps}
                >
                  <Plus className="h-4 w-4" />
                  {hasCompletedAllSteps ? "All Steps Added" : "Create Step"}
                  <Badge variant="outline" className="border-indigo-200 bg-indigo-50 text-indigo-700">
                    {steps.length}/{sequence?.totalSteps} step{steps.length === 1 ? "" : "s"}
                  </Badge>
                </Button>
              }
            />
          </div>
        </div>
      </div>

      {steps.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/40 px-6 py-14 text-center">
          <h3 className="text-xl font-semibold text-slate-900">No steps found.</h3>
          <p className="mt-2 text-sm text-slate-500">
            This sequence has no generated steps yet. Later you can add and manage them here.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          {/* All steps in this sequence: */}
          <Accordion type="multiple" className="w-full">
            {steps.map((step) => (
              <AccordionItem key={step.id} value={step.id}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex w-full flex-col items-start gap-3 pr-4 text-left sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-base font-semibold text-slate-900">
                          Step {step.stepOrder}
                        </span>
                        <Badge
                          variant="outline"
                          className={ 
                            step.stepType === "EMAIL"
                              ? "border-indigo-200 bg-indigo-100 text-indigo-700 flex items-center gap-1"
                              : step.stepType === "SMS"
                                ? "border-violet-200 bg-violet-100 text-violet-700 flex items-center gap-1"
                                : step.stepType === "WHATSAPP"
                                  ? "border-emerald-200 bg-emerald-100 text-emerald-700 flex items-center gap-1"
                                  : "border-amber-200 bg-amber-100 text-amber-700 flex items-center gap-1"
                          }
                        >
                          {step.stepType === "EMAIL" ? (
                            <Mail className="h-4 w-4" />
                          ) : step.stepType === "SMS" ? (
                            <MessageSquare className="h-4 w-4" />
                          ) : step.stepType === "WHATSAPP" ? (
                            <MessageCircle className="h-4 w-4" />
                          ) : (
                            <PhoneCall className="h-4 w-4" />
                          )}
                          {step.stepType}
                        </Badge>
                        <Badge variant="outline" className={getStepStatusBadgeClass(step.status)}>
                          {step.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500">
                        Scheduled: {formatDateTime(step.scheduledAt)}
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 gap-4 rounded-xl bg-slate-50/70 p-4 lg:grid-cols-2">
                    <div className="flex flex-wrap items-center justify-end gap-2 lg:col-span-2">
                      <Button
                        type="button"
                        onClick={() => handleGenerateContent(step.id)}
                        disabled={generatingStepId === step.id}
                        className="invisible group relative overflow-hidden bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 text-white shadow-sm transition-all hover:scale-[1.02] hover:shadow-md"
                      >
                        <span className="absolute inset-0 bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.28),transparent)] opacity-0 transition-opacity duration-500 group-hover:animate-[shine_1.2s_ease-in-out] group-hover:opacity-100" />
                        {generatingStepId === step.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                        )}
                        Generate Content
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-rose-600 hover:text-rose-700"
                            disabled={deletingStepId === step.id}
                          >
                            {deletingStepId === step.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                            <span className="sr-only">Delete step</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete step?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will remove step {step.stepOrder} and reorder the remaining steps.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-rose-600 text-white hover:bg-rose-700"
                              onClick={() => handleDeleteStep(step.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>

                    <div className="lg:col-span-2">
                      <SequenceStepEditor sequenceId={id ?? ""} step={step} />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}
    </div>
  );
}
