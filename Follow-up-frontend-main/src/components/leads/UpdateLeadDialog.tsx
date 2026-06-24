import { useEffect, useMemo, useState, type ReactNode } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  createLeadFormSchema,
  type CreateLeadFormValues,
} from "@/schema/leads/createLead.schema";
import {
  useGetSingleLeadQuery,
  useUpdateLeadMutation,
} from "@/store/features/leads/leadsApi";
import { buildUpdateLeadPayload } from "@/lib/leads/leadFormPayload";
import { normalizePhoneInput } from "@/utils/phone";
import { dismissToast, showError, showLoading, showSuccess } from "@/utils/toast";

interface UpdateLeadDialogProps {
  leadId: string;
  trigger: ReactNode;
}

export default function UpdateLeadDialog({ leadId, trigger }: UpdateLeadDialogProps) {
  const [open, setOpen] = useState(false);
  const [updateLead, { isLoading: isUpdating }] = useUpdateLeadMutation();
  const { data: singleLeadData, isFetching: isLeadLoading } = useGetSingleLeadQuery(leadId, {
    skip: !open,
  });

  const updateLeadSchema = useMemo(() => createLeadFormSchema(() => 8), []);

  const form = useForm<CreateLeadFormValues>({
    resolver: zodResolver(updateLeadSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      location: "",
      followUpStage: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (singleLeadData?.data) {
      form.reset({
        name: singleLeadData.data.name,
        email: singleLeadData.data.email ?? "",
        phone: singleLeadData.data.phone ?? "",
        company: singleLeadData.data.company ?? "",
        location: singleLeadData.data.location ?? "",
        followUpStage: singleLeadData.data.followUpStage ?? "",
        notes: singleLeadData.data.notes ?? "",
      });
    }
  }, [singleLeadData, form]);

  const onSubmit = async (values: CreateLeadFormValues) => {
    const loadingToastId = showLoading("Updating lead...");
    const normalizedPhone = normalizePhoneInput(values.phone ?? "");

    try {
      const response = await updateLead({
        id: leadId,
        body: buildUpdateLeadPayload(values, { phone: normalizedPhone }),
      }).unwrap();

      showSuccess(response.message || "Lead updated successfully");
      setOpen(false);
    } catch (error: unknown) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        "Failed to update lead. Please try again.";
      showError(errorMessage);
    } finally {
      dismissToast(loadingToastId);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="my-4 w-[calc(100vw-2rem)] max-h-[calc(90vh-2rem)] max-w-2xl overflow-y-auto p-0">
        <DialogHeader className="border-b px-6 py-5 text-left">
          <DialogTitle className="text-3xl font-semibold text-slate-800">Update Lead</DialogTitle>
        </DialogHeader>

        {isLeadLoading ? (
          <div className="px-6 py-8 text-sm text-slate-500">Loading lead details...</div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 px-6 py-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Name <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input placeholder="john.doe@company.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="1234567890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <FormControl>
                        <Input placeholder="Acme Corp" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="New York, NY" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="followUpStage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Follow-up Stage</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Follow Up Stage e.g No Show, After Sale, PRD, Hot Lead, Cancel"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Additional notes"
                        className="min-h-[96px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="border-t px-0 pt-5">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isUpdating}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  {isUpdating ? "Updating..." : "Update Lead"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
