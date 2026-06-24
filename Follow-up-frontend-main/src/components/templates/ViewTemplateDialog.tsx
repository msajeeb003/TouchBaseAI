import { type ReactNode, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useLazyGetPromptTemplateByIdQuery } from "@/store/features/templates/templatesApi";

interface ViewTemplateDialogProps {
  templateId: string;
  trigger: ReactNode;
}

const getStageBadgeClass = (stage: string) => {
  const value = stage.toLowerCase();
  if (value.includes("no")) return "bg-indigo-100 text-indigo-700 border-indigo-200";
  if (value.includes("after")) return "bg-purple-100 text-purple-700 border-purple-200";
  if (value.includes("cancel")) return "bg-pink-100 text-pink-700 border-pink-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
};

export default function ViewTemplateDialog({ templateId, trigger }: ViewTemplateDialogProps) {
  const [open, setOpen] = useState(false);
  const [fetchTemplate, { data, isFetching, isError }] = useLazyGetPromptTemplateByIdQuery();
  const template = data?.data;

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      fetchTemplate(templateId);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="w-[calc(100vw-1.5rem)] max-w-3xl p-0 sm:w-full">
        <DialogHeader className="px-4 pt-5 sm:px-6">
          <DialogTitle>View Prompt Template</DialogTitle>
        </DialogHeader>

        <div className="max-h-[75vh] overflow-y-auto px-4 pb-5 sm:px-6 sm:pb-6">
          {isFetching ? (
            <p className="mt-2 text-sm text-slate-500">Loading template...</p>
          ) : isError ? (
            <p className="mt-2 text-sm text-red-600">Failed to load template details.</p>
          ) : template ? (
            <div className="mt-2 space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                <h3 className="text-base font-semibold text-slate-900 sm:text-lg">{template.name}</h3>
                <Badge variant="outline" className={getStageBadgeClass(template.followUpStage)}>
                  {template.followUpStage}
                </Badge>
              </div>
              <div className="rounded-md border bg-slate-50 p-3 sm:p-4">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                  {template.promptText}
                </p>
              </div>
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-500">Template not found.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
