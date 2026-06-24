import { FileText, Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  useDeletePromptTemplateMutation,
  useGetPromptTemplatesQuery,
} from "@/store/features/templates/templatesApi";
import ViewTemplateDialog from "@/components/templates/ViewTemplateDialog";
import { dismissToast, showError, showLoading, showSuccess } from "@/utils/toast";

const getStageBadgeClass = (stage: string) => {
  const value = stage.toLowerCase();
  if (value.includes("no")) return "bg-indigo-100 text-indigo-700 border-indigo-200";
  if (value.includes("after")) return "bg-purple-100 text-purple-700 border-purple-200";
  if (value.includes("cancel")) return "bg-pink-100 text-pink-700 border-pink-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
};

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const getSummary = (promptText: string) => {
  const plain = promptText.replace(/\s+/g, " ").trim();
  return plain.length > 90 ? `${plain.slice(0, 90)}...` : plain;
};

export default function TemplatesPage() {
  const navigate = useNavigate();
  const [deletingTemplateId, setDeletingTemplateId] = useState<string | null>(null);
  const [deletePromptTemplate] = useDeletePromptTemplateMutation();
  const { data, isLoading, isError } = useGetPromptTemplatesQuery();
  const templates = data?.data ?? [];

  const handleDeleteTemplate = async (templateId: string) => {
    const loadingToastId = showLoading("Deleting template...");
    setDeletingTemplateId(templateId);

    try {
      const response = await deletePromptTemplate(templateId).unwrap();
      showSuccess(response.message || "Prompt template deleted successfully");
    } catch (error: unknown) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        "Failed to delete prompt template. Please try again.";
      showError(errorMessage);
    } finally {
      dismissToast(loadingToastId);
      setDeletingTemplateId(null);
    }
  };

  if (isLoading) {
    return <div className="rounded-lg border border-dashed p-8 text-sm text-slate-500">Loading templates...</div>;
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-sm text-red-600">
        Failed to fetch templates.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          {/* <p className="text-sm text-slate-500">Follow Up Dashboard</p> */}
          <h2 className="text-4xl font-semibold text-slate-900">
            Prompt Templates{" "}
            <span className="text-xl font-medium text-slate-400">({templates.length})</span>
          </h2>
        </div>
        <Button
          className="gap-2 bg-indigo-600 hover:bg-indigo-700"
          onClick={() => navigate("/dashboard/templates/new")}
        >
          <Plus className="h-4 w-4" />
          New Template
        </Button>
      </div>

      {templates.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/40 px-6 py-14 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
            <FileText className="h-5 w-5 text-indigo-600" />
          </div>
          <h3 className="text-2xl font-semibold text-slate-900">No prompt templates yet.</h3>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500">
            Get started by creating your first template to automate your follow-up sequences.
          </p>
          <Button
            className="mt-6 bg-indigo-600 hover:bg-indigo-700"
            onClick={() => navigate("/dashboard/templates/new")}
          >
            Create First Template
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-2">
          {templates.map((template) => (
            <div key={template.id} className="rounded-md border bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-start justify-between gap-3">
                <h3 className="text-2xl font-semibold text-slate-800">{template.name}</h3>
                <p className={`text-xs text-center border rounded-full px-2 py-1 font-medium ${getStageBadgeClass(template.followUpStage)}`}>
                  {template.followUpStage}
                </p>
              </div>

              <p className="min-h-14 text-md text-slate-500">{getSummary(template.promptText)}</p>

              <div className="mt-5 flex items-center justify-between border-t pt-4">
                <p className="text-sm text-slate-500">Updated: {formatDate(template.updatedAt)}</p>
                <div className="flex items-center gap-4 text-base">
                  <ViewTemplateDialog
                    templateId={template.id}
                    trigger={
                      <button className="text-slate-600 hover:text-slate-700" type="button">
                        View
                      </button>
                    }
                  />
                  <button
                    className="text-indigo-600 hover:text-indigo-700"
                    type="button"
                    onClick={() => navigate(`/dashboard/templates/${template.id}/edit`)}
                  >
                    Edit
                  </button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        className="text-rose-500 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-70"
                        type="button"
                        disabled={deletingTemplateId === template.id}
                      >
                        {deletingTemplateId === template.id ? "Deleting..." : "Delete"}
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete template?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete{" "}
                          <span className="font-medium text-foreground">{template.name}</span>.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-rose-600 text-white hover:bg-rose-700"
                          onClick={() => handleDeleteTemplate(template.id)}
                        >
                          {deletingTemplateId === template.id ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Deleting
                            </>
                          ) : (
                            "Delete"
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
