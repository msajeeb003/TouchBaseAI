import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useBulkDeleteLeadsMutation } from "@/store/features/leads/leadsApi";
import { dismissToast, showError, showLoading, showSuccess } from "@/utils/toast";

interface LeadsBulkSelectionToolbarProps {
  selectedIds: string[];
  onDeleted: () => void;
}

export function LeadsBulkSelectionToolbar({ selectedIds, onDeleted }: LeadsBulkSelectionToolbarProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bulkDelete, { isLoading }] = useBulkDeleteLeadsMutation();

  if (selectedIds.length === 0) return null;

  const count = selectedIds.length;

  const handleConfirm = async () => {
    const loadingToastId = showLoading(`Deleting ${count} lead${count === 1 ? "" : "s"}...`);

    try {
      const response = await bulkDelete({ leadIds: selectedIds }).unwrap();
      const { deletedCount, skippedCount } = response.data;

      let message = response.message || `${deletedCount} lead(s) deleted`;
      if (skippedCount > 0) {
        message += ` (${skippedCount} skipped)`;
      }
      showSuccess(message);
      setDialogOpen(false);
      onDeleted();
    } catch (error: unknown) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        "Failed to delete leads. Please try again.";
      showError(errorMessage);
    } finally {
      dismissToast(loadingToastId);
    }
  };

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-rose-100 bg-rose-50/80 px-3 py-2">
      <p className="text-sm text-slate-700">
        {count} lead{count === 1 ? "" : "s"} selected
      </p>
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogTrigger asChild>
          <Button type="button" variant="destructive" size="sm" className="gap-2">
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {count} lead{count === 1 ? "" : "s"}?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone. The selected leads will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              className="bg-rose-600 text-white hover:bg-rose-700"
              disabled={isLoading}
              onClick={() => void handleConfirm()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
