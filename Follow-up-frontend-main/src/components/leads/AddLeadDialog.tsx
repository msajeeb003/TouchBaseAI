import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { buildCreateLeadPayload } from "@/lib/leads/leadFormPayload";
import { useCreateLeadMutation } from "@/store/features/leads/leadsApi";
import { countryCodes, getMinLengthForCountryIso } from "@/utils/countryCode";
import { normalizePhoneInput } from "@/utils/phone";
import { dismissToast, showError, showLoading, showSuccess } from "@/utils/toast";

interface AddLeadDialogProps {
  trigger: ReactNode;
}

const DEFAULT_COUNTRY_ISO = "US";

export default function AddLeadDialog({ trigger }: AddLeadDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedCountryIso, setSelectedCountryIso] = useState(DEFAULT_COUNTRY_ISO);
  const [createLead, { isLoading }] = useCreateLeadMutation();

  const minNationalDigitsRef = useRef(() => getMinLengthForCountryIso(DEFAULT_COUNTRY_ISO));
  minNationalDigitsRef.current = () => getMinLengthForCountryIso(selectedCountryIso);

  const leadFormSchema = useMemo(
    () => createLeadFormSchema(() => minNationalDigitsRef.current()),
    []
  );

  const form = useForm<CreateLeadFormValues>({
    resolver: zodResolver(leadFormSchema),
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
    if (form.getValues("phone").trim()) {
      void form.trigger("phone");
    }
  }, [selectedCountryIso, form]);

  const onSubmit = async (values: CreateLeadFormValues) => {
    const loadingToastId = showLoading("Creating lead...");
    const dial =
      countryCodes.find((c) => c.country === selectedCountryIso)?.code ?? "+880";
    const normalizedPhone = normalizePhoneInput(values.phone ?? "");
    const phoneWithCountryCode = normalizedPhone.startsWith("+")
      ? normalizedPhone
      : `${dial}${normalizedPhone}`;
    try {
      const response = await createLead(
        buildCreateLeadPayload(values, {
          phone: normalizedPhone ? phoneWithCountryCode : undefined,
        }),
      ).unwrap();

      showSuccess(response.message || "Lead created successfully");
      form.reset();
      setSelectedCountryIso(DEFAULT_COUNTRY_ISO);
      setOpen(false);
    } catch (error: unknown) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        "Failed to create lead. Please try again.";
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
          <DialogTitle className="text-3xl font-semibold text-slate-800">Add New Lead</DialogTitle>
        </DialogHeader>

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
                    <div className="flex gap-2">
                      <Select
                        value={selectedCountryIso}
                        onValueChange={setSelectedCountryIso}
                      >
                        <SelectTrigger className="w-[150px] shrink-0">
                          <SelectValue placeholder="Code" />
                        </SelectTrigger>
                        <SelectContent className="max-h-80">
                          {countryCodes.map((item) => (
                            <SelectItem key={item.country} value={item.country}>
                              {item.country} ({item.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="1234567890"
                        inputMode="tel"
                        className="flex-1"
                        {...field}
                      />
                    </div>
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
                    <Input placeholder="Follow Up Stage e.g No Show, After Sale, PRD, Hot Lead, Cancel" {...field} />
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
              <Button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700">
                {isLoading ? "Adding..." : "Add Lead"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
