import { useState, type DragEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Check,
  CircleHelp,
  GripVertical,
  Loader2,
  Mail,
  MessageCircle,
  MessageSquare,
  Minus,
  PhoneCall,
  Plus,
  Sparkles,
} from "lucide-react";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  generatePromptTextSchema,
  type GeneratePromptTextFormValues,
} from "@/schema/templates/generatePromptText.schema";
import { STEP_TYPE, STEP_TYPE_VALUES, type StepType } from "@/constants/stepType";
import { useGeneratePromptTextMutation } from "@/store/features/templates/templatesApi";
import type { GeneratePromptTextRequestBody } from "@/types/templates";
import { dismissToast, showError, showLoading, showSuccess } from "@/utils/toast";
import { cn } from "@/lib/utils";

interface GeneratePromptTextDialogProps {
  onGenerated: (promptText: string) => void;
}

const TONE_OPTIONS = [
  { label: "Professional & warm", value: "Professional & warm" },
  { label: "Direct & concise", value: "Direct & concise" },
  { label: "Casual & friendly", value: "Casual & friendly" },
  { label: "Persistent & bold", value: "Persistent & bold" },
] as const;

const CHANNEL_CONFIG: {
  type: StepType;
  label: string;
  icon: typeof Mail;
}[] = [
  { type: STEP_TYPE.EMAIL, label: "Email", icon: Mail },
  { type: STEP_TYPE.SMS, label: "SMS", icon: MessageSquare },
  { type: STEP_TYPE.WHATSAPP, label: "WhatsApp", icon: MessageCircle },
  { type: STEP_TYPE.CALL, label: "Call", icon: PhoneCall },
];

export default function GeneratePromptTextDialog({ onGenerated }: GeneratePromptTextDialogProps) {
  const [open, setOpen] = useState(false);
  const [generatePromptText, { isLoading }] = useGeneratePromptTextMutation();

  const form = useForm<GeneratePromptTextFormValues>({
    resolver: zodResolver(generatePromptTextSchema),
    defaultValues: {
      followUpScenario: "",
      serviceDescription: "",
      sequenceGoal: "",
      senderName: "",
      ctaLink: "",
      companyName: "",
      stepTypesPattern: [],
      intervalDays: 3,
      toneStyle: "",
      additionalNotes: "",
    },
  });

  const onSubmit = async (values: GeneratePromptTextFormValues) => {
    const loadingToastId = showLoading("Generating prompt text...");

    try {
      const payload: GeneratePromptTextRequestBody = {
        followUpScenario: values.followUpScenario,
        serviceDescription: values.serviceDescription,
        sequenceGoal: values.sequenceGoal,
        senderName: values.senderName,
        stepTypesPattern: values.stepTypesPattern,
        intervalDays: values.intervalDays,
        toneStyle: values.toneStyle,
        ...(values.ctaLink ? { ctaLink: values.ctaLink } : {}),
        ...(values.companyName ? { companyName: values.companyName } : {}),
        ...(values.additionalNotes ? { additionalNotes: values.additionalNotes } : {}),
      };

      generatePromptTextSchema.parse(payload);
      // console.log({payload});
      const response = await generatePromptText(payload).unwrap();
      const generated = response.data.promptText;
      onGenerated(generated);
      showSuccess(response.message || "Prompt text generated successfully");
      setOpen(false);
    } catch (error: unknown) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        "Failed to generate prompt text. Please try again.";
      showError(errorMessage);
    } finally {
      dismissToast(loadingToastId);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          size="sm"
          className={cn(
            "h-8 gap-1.5 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 text-white shadow-sm hover:from-violet-700 hover:via-fuchsia-700 hover:to-indigo-700",
          )}
        >
          <Sparkles className="h-3.5 w-3.5" />
          Generate with AI
        </Button>
      </DialogTrigger>
      <DialogContent className="my-4 w-[calc(100vw-2rem)] max-h-[calc(90vh-2rem)] overflow-y-auto p-0 sm:max-w-2xl">
        <DialogHeader className="border-b px-6 py-5 text-left">
          <DialogTitle className="text-2xl font-semibold text-slate-800">
            Generate Prompt Text
          </DialogTitle>
        </DialogHeader>

        <TooltipProvider delayDuration={120}>
          <Form {...form}>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                event.stopPropagation();
                void form.handleSubmit(onSubmit)(event);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.stopPropagation();
                }
              }}
              className="space-y-5 px-6 py-5"
            >
              <FormField
                control={form.control}
                name="followUpScenario"
                render={({ field }) => (
                  <FormItem>
                    <FieldLabel
                      label="Follow-up Scenario"
                      required
                      hint="Describe the exact situation. Example: Client booked a call but did not show up, now needs a re-engagement sequence."
                    />
                    <FormControl>
                      <Textarea
                        className="min-h-20 resize-y"
                        placeholder="Example: Client booked a call but did not show up. Need to re-engage politely."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="serviceDescription"
                render={({ field }) => (
                  <FormItem>
                    <FieldLabel
                      label="Service Description"
                      required
                      hint="Briefly explain what you offer and the outcome. Example: AI-powered recruitment automation that reduces hiring time by 60%."
                    />
                    <FormControl>
                      <Textarea
                        className="min-h-20 resize-y"
                        placeholder="Example: We provide AI-powered recruitment automation that reduces hiring time by 60%."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="sequenceGoal"
                  render={({ field }) => (
                    <FormItem>
                      <FieldLabel
                        label="Sequence Goal"
                        required
                        hint="What outcome should this follow-up sequence achieve? Example: Book a 15-minute discovery call."
                      />
                      <FormControl>
                        <Input placeholder="Example: Book a 15-minute discovery call." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="senderName"
                  render={({ field }) => (
                    <FormItem>
                      <FieldLabel
                        label="Sender Name"
                        required
                        hint="Name that should appear as the sender in generated messages. Example: Artur Abdullin."
                      />
                      <FormControl>
                        <Input placeholder="Example: Artur Abdullin" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FieldLabel
                        label="Company Name"
                        hint="Company name to mention in prompt context. Example: Artech Digital."
                      />
                      <FormControl>
                        <Input placeholder="Example: Artech Digital" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ctaLink"
                  render={({ field }) => (
                    <FormItem>
                      <FieldLabel
                        label="CTA Link"
                        hint="Call-to-action URL for booking or next step. Example: https://calendly.com/yourname/30min-call"
                      />
                      <FormControl>
                        <Input placeholder="Example: https://calendly.com/yourname/30min-call" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* <div className="grid grid-cols-1 gap-4 md:grid-cols-2"> */}
                <FormField
                  control={form.control}
                  name="stepTypesPattern"
                  render={({ field }) => (
                    <FormItem>
                      <FieldLabel
                        label="Step Types Pattern"
                        required
                        hint={`Select channels and drag to set the order. Allowed: ${STEP_TYPE_VALUES.join(", ")}.`}
                      />
                      <FormControl>
                        <StepTypesPatternPicker value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="intervalDays"
                  render={({ field }) => (
                    <FormItem>
                      <FieldLabel
                        label="Days between"
                        required
                        hint="Gap between follow-ups in days. Example: 3 means every 3 days."
                      />
                      <FormControl>
                        <NumberStepper
                          value={field.value}
                          min={1}
                          max={30}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              {/* </div> */}

              <FormField
                control={form.control}
                name="toneStyle"
                render={({ field }) => (
                  <FormItem>
                    <FieldLabel
                      label="Tone"
                      required
                      hint="Choose the writing tone for generated messages."
                    />
                    <FormControl>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {TONE_OPTIONS.map((option) => {
                          const selected = field.value === option.value;
                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => field.onChange(option.value)}
                              className={cn(
                                "rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                                selected
                                  ? "border-indigo-300 bg-indigo-50 font-medium text-indigo-800 ring-1 ring-indigo-200"
                                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
                              )}
                            >
                              {option.label}
                            </button>
                          );
                        })}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="additionalNotes"
                render={({ field }) => (
                  <FormItem>
                    <FieldLabel
                      label="Additional Notes"
                      hint="Extra constraints or instructions. Example: Never mention competitors."
                    />
                    <FormControl>
                      <Textarea
                        className="min-h-20 resize-y"
                        placeholder="Example: Never mention competitors"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="border-t px-0 pt-5">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setOpen(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  disabled={isLoading}
                  className="bg-indigo-600 hover:bg-indigo-700"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    void form.handleSubmit(onSubmit)();
                  }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate Prompt"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </TooltipProvider>
      </DialogContent>
    </Dialog>
  );
}

function StepTypesPatternPicker({
  value,
  onChange,
}: {
  value: StepType[];
  onChange: (pattern: StepType[]) => void;
}) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const toggleChannel = (type: StepType) => {
    if (value.includes(type)) {
      onChange(value.filter((item) => item !== type));
      return;
    }
    onChange([...value, type]);
  };

  const reorder = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    const next = [...value];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    onChange(next);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>, index: number) => {
    event.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    reorder(draggedIndex, index);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {CHANNEL_CONFIG.map(({ type, label, icon: Icon }) => {
          const selected = value.includes(type);
          return (
            <button
              key={type}
              type="button"
              onClick={() => toggleChannel(type)}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors",
                selected
                  ? "border-indigo-300 bg-indigo-50 font-medium text-indigo-800 ring-1 ring-indigo-200"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
              {selected ? <Check className="h-3.5 w-3.5 text-indigo-600" /> : null}
            </button>
          );
        })}
      </div>

      {value.length > 0 ? (
        <div className="space-y-2 rounded-lg border border-dashed border-slate-200 bg-slate-50/80 p-3">
          <p className="flex items-center gap-1.5 text-xs text-slate-500">
            <GripVertical className="h-3.5 w-3.5" />
            Drag to reorder
          </p>
          <div className="flex flex-wrap gap-2">
            {value.map((type, index) => {
              const config = CHANNEL_CONFIG.find((item) => item.type === type);
              if (!config) return null;
              const Icon = config.icon;

              return (
                <div
                  key={`${type}-${index}`}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(event) => handleDragOver(event, index)}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    "inline-flex cursor-grab items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-700 shadow-sm active:cursor-grabbing",
                    draggedIndex === index && "opacity-60 ring-2 ring-indigo-200",
                  )}
                >
                  <GripVertical className="h-4 w-4 text-slate-400" />
                  <Icon className="h-3.5 w-3.5 text-slate-500" />
                  <span>{config.label}</span>
                  <span className="text-xs text-slate-400">#{index + 1}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="text-xs text-slate-500">Select at least one channel.</p>
      )}
    </div>
  );
}

function NumberStepper({
  value,
  min,
  max,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  const decrement = () => onChange(Math.max(min, value - 1));
  const increment = () => onChange(Math.min(max, value + 1));

  return (
    <div className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-9 w-9 shrink-0 text-slate-600"
        onClick={decrement}
        disabled={value <= min}
        aria-label="Decrease days"
      >
        <Minus className="h-4 w-4" />
      </Button>
      <span className="min-w-[2.5rem] text-center text-lg font-semibold tabular-nums text-slate-800">
        {value}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-9 w-9 shrink-0 text-slate-600"
        onClick={increment}
        disabled={value >= max}
        aria-label="Increase days"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}

function FieldHint({ text }: { text: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Tooltip open={open} onOpenChange={setOpen}>
      <TooltipTrigger asChild>
        <button
          type="button"
          tabIndex={-1}
          aria-label="Field information"
          onPointerEnter={() => setOpen(true)}
          onPointerLeave={() => setOpen(false)}
          onFocus={(event) => {
            event.currentTarget.blur();
            setOpen(false);
          }}
          className="inline-flex h-4 w-4 items-center justify-center rounded-full text-slate-400 transition-colors hover:text-slate-600"
        >
          <CircleHelp className="h-4 w-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs whitespace-pre-wrap text-left text-xs leading-5">
        {text}
      </TooltipContent>
    </Tooltip>
  );
}

function FieldLabel({
  label,
  hint,
  required = false,
}: {
  label: string;
  hint: string;
  required?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <FormLabel>
        {label}
        {required ? <span className="ml-0.5 text-destructive">*</span> : null}
      </FormLabel>
      <FieldHint text={hint} />
    </div>
  );
}
