import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
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
import {
  createPromptTemplateSchema,
  type CreatePromptTemplateFormValues,
} from "@/schema/templates/createPromptTemplate.schema";
import {
  useGetPromptTemplateByIdQuery,
  useUpdatePromptTemplateMutation,
} from "@/store/features/templates/templatesApi";
import PromptTemplateReference from "@/components/templates/PromptTemplateReference";
import GeneratePromptTextDialog from "@/components/templates/GeneratePromptTextDialog";
import { dismissToast, showError, showLoading, showSuccess } from "@/utils/toast";

export default function EditTemplatePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [updatePromptTemplate, { isLoading: isUpdating }] = useUpdatePromptTemplateMutation();
  const { data, isLoading: isTemplateLoading } = useGetPromptTemplateByIdQuery(id ?? "", {
    skip: !id,
  });

  const form = useForm<CreatePromptTemplateFormValues>({
    resolver: zodResolver(createPromptTemplateSchema),
    defaultValues: {
      name: "",
      followUpStage: "",
      promptText: "",
    },
  });

  useEffect(() => {
    if (data?.data) {
      form.reset({
        name: data.data.name,
        followUpStage: data.data.followUpStage,
        promptText: data.data.promptText,
      });
    }
  }, [data, form]);

  const onSubmit = async (values: CreatePromptTemplateFormValues) => {
    if (!id) return;

    const loadingToastId = showLoading("Updating prompt template...");

    try {
      const response = await updatePromptTemplate({
        id,
        body: {
          name: values.name,
          followUpStage: values.followUpStage,
          promptText: values.promptText,
        },
      }).unwrap();
      showSuccess(response.message || "Prompt template updated successfully");
      navigate("/dashboard/templates");
    } catch (error: unknown) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        "Failed to update prompt template. Please try again.";
      showError(errorMessage);
    } finally {
      dismissToast(loadingToastId);
    }
  };

  if (isTemplateLoading) {
    return <div className="rounded-lg border border-dashed p-8 text-sm text-slate-500">Loading template...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-4xl font-semibold text-slate-900">Edit Prompt Template</h2>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template Name</FormLabel>
                    <FormControl>
                      <Input placeholder="NoShow Follow-up Template" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="followUpStage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Follow-up Stage</FormLabel>
                    <FormControl>
                      <Input placeholder="NoShow" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="promptText"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between gap-3">
                    <FormLabel>Prompt Text</FormLabel>
                    <GeneratePromptTextDialog
                      onGenerated={(promptText) => {
                        form.setValue("promptText", promptText, {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      }}
                    />
                  </div>
                  <FormControl>
                    <Textarea
                      placeholder="You are a virtual assistant for {{BusinessName}}..."
                      className="min-h-44 resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-end gap-3 border-t pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/dashboard/templates")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdating} className="bg-indigo-600 hover:bg-indigo-700">
                {isUpdating ? "Saving..." : "Save Template"}
              </Button>
            </div>
          </form>
        </Form>
      </div>

      <PromptTemplateReference />
    </div>
  );
}
