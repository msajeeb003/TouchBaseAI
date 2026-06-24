import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CalendarDays,
  Clock3,
  Loader2,
  Mail,
  MessageCircle,
  MessageSquare,
  PhoneCall,
  Send,
  StickyNote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { SequenceStepCallLogSummary } from "@/components/sequences/steps/SequenceStepCallLogSummary";
import {
  updateStepFormSchema,
  type UpdateStepFormValues,
} from "@/schema/sequences/updateStep.schema";
import { useUpdateSequenceStepMutation } from "@/store/features/sequences/sequencesApi";
import type { SequenceStepItem } from "@/types/sequences";
import { dismissToast, showError, showLoading, showSuccess } from "@/utils/toast";

interface SequenceStepEditorProps {
  sequenceId: string;
  step: SequenceStepItem;
}

const toDateTimeLocalValue = (value: string | null | undefined) => {
  if (!value) return "";
  const date = new Date(value);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const formatDateTime = (value: string | null | undefined) => {
  if (!value) return "N/A";
  return new Date(value).toLocaleString();
};

export default function SequenceStepEditor({ sequenceId, step }: SequenceStepEditorProps) {
  const [updateSequenceStep, { isLoading }] = useUpdateSequenceStepMutation();

  const form = useForm<UpdateStepFormValues>({
    resolver: zodResolver(updateStepFormSchema),
    defaultValues: {
      subject: step.subject ?? "",
      content: step.content ?? "",
      scheduledAt: toDateTimeLocalValue(step.scheduledAt),
    },
  });

  useEffect(() => {
    form.reset({
      subject: step.subject ?? "",
      content: step.content ?? "",
      scheduledAt: toDateTimeLocalValue(step.scheduledAt),
    });
  }, [step, form]);

  const onSubmit = async (values: UpdateStepFormValues) => {
    const payload: {
      subject?: string | null;
      content?: string | null;
      scheduledAt?: string;
    } = {};

    if (values.subject.trim() !== "") {
      payload.subject = values.subject;
    }

    if (values.content.trim() !== "") {
      payload.content = values.content;
    }

    if (values.scheduledAt.trim() !== "") {
      payload.scheduledAt = new Date(values.scheduledAt).toISOString();
    }

    if (Object.keys(payload).length === 0) {
      showSuccess("No values to update");
      return;
    }

    const loadingToastId = showLoading("Updating step...");
    try {
      const response = await updateSequenceStep({
        sequenceId,
        stepId: step.id,
        body: payload,
      }).unwrap();
      showSuccess(response.message || "Step updated successfully");
    } catch (error: unknown) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        "Failed to update step. Please try again.";
      showError(errorMessage);
    } finally {
      dismissToast(loadingToastId);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="space-y-4 lg:col-span-2">
          {step.stepType === "EMAIL" ? (
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                    <StickyNote className="h-4 w-4 text-slate-400" />
                    Subject
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Email subject (optional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : null}

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                  {step.stepType === "EMAIL" ? (
                    <Mail className="h-4 w-4 text-slate-400" />
                  ) : step.stepType === "SMS" ? (
                    <MessageSquare className="h-4 w-4 text-slate-400" />
                  ) : step.stepType === "WHATSAPP" ? (
                    <MessageCircle className="h-4 w-4 text-slate-400" />
                  ) : (
                    <PhoneCall className="h-4 w-4 text-slate-400" />
                  )}
                  Content
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Step content will appear here..."
                    className="min-h-40 resize-y bg-white"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="scheduledAt"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                <CalendarDays className="h-4 w-4 text-slate-400" />
                Scheduled At
              </FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <br />

        <div className="flex items-start gap-3">
          <Send className="mt-0.5 h-4 w-4 text-slate-400" />
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Sent At</p>
            <p className="text-sm text-slate-700">{formatDateTime(step.sentAt)}</p>
          </div>
        </div>

        <div className="flex items-start gap-3 lg:col-span-2">
          <Clock3 className="mt-0.5 h-4 w-4 text-slate-400" />
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Send log</p>
            <p className="text-sm text-slate-700">{step.sendLog || "No send log available."}</p>
          </div>
        </div>

        {step.callLog ? <SequenceStepCallLogSummary log={step.callLog} /> : null}

        <div className="flex justify-end lg:col-span-2">
          <Button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Content"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
