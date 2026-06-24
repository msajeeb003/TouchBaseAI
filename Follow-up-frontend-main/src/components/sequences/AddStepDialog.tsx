import { useEffect, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createStepFormSchema,
  type CreateStepFormValues,
} from "@/schema/sequences/createStep.schema";
import { useCreateSequenceStepMutation } from "@/store/features/sequences/sequencesApi";
import { dismissToast, showError, showLoading, showSuccess } from "@/utils/toast";

interface AddStepDialogProps {
  sequenceId: string;
  nextStepOrder: number;
  disabled?: boolean;
  trigger: ReactNode;
}

const toDateTimeLocalValue = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export default function AddStepDialog({
  sequenceId,
  nextStepOrder,
  disabled = false,
  trigger,
}: AddStepDialogProps) {
  const [open, setOpen] = useState(false);
  const [createSequenceStep, { isLoading }] = useCreateSequenceStepMutation();

  const form = useForm<CreateStepFormValues>({
    resolver: zodResolver(createStepFormSchema),
    defaultValues: {
      stepOrder: nextStepOrder,
      stepType: "EMAIL",
      scheduledAt: toDateTimeLocalValue(new Date()),
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        stepOrder: nextStepOrder,
        stepType: "EMAIL",
        scheduledAt: toDateTimeLocalValue(new Date()),
      });
    }
  }, [nextStepOrder, open, form]);

  const onSubmit = async (values: CreateStepFormValues) => {
    const loadingToastId = showLoading("Creating step...");

    try {
      const response = await createSequenceStep({
        sequenceId,
        body: {
          stepOrder: values.stepOrder,
          stepType: values.stepType,
          scheduledAt: new Date(values.scheduledAt).toISOString(),
        },
      }).unwrap();

      showSuccess(response.message || "Step added successfully");
      setOpen(false);
    } catch (error: unknown) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        "Failed to create step. Please try again.";
      showError(errorMessage);
    } finally {
      dismissToast(loadingToastId);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen} >
      <DialogTrigger asChild disabled={disabled}>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-xl p-0 ">
        <DialogHeader className="border-b px-6 py-5 text-left">
          <DialogTitle className="text-2xl font-semibold text-slate-800">Create Step</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 px-6 py-5">
            <FormField
              control={form.control}
              name="stepOrder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Step Order</FormLabel>
                  <FormControl>
                    <Input {...field} readOnly className="bg-slate-50" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="stepType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Step Type</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select step type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="EMAIL">EMAIL</SelectItem>
                      <SelectItem value="SMS">SMS</SelectItem>
                      <SelectItem value="WHATSAPP">WHATSAPP</SelectItem>
                      <SelectItem value="CALL">CALL</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="scheduledAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scheduled At</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="border-t px-0 pt-5">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700">
                {isLoading ? "Creating..." : "Create Step"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
