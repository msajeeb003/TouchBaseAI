import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  FileText,
  Loader2,
  Mail,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  Upload,
  Users2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import AddLeadDialog from "@/components/leads/AddLeadDialog";
import ImportLeadsDialog from "@/components/leads/ImportLeadsDialog";
import { LeadsBulkSelectionToolbar } from "@/components/leads/LeadsBulkSelectionToolbar";
import UpdateLeadDialog from "@/components/leads/UpdateLeadDialog";
import { useLeadsTableRowSelection } from "@/hooks/useLeadsTableRowSelection";
import {
  formatLeadAddedAt,
  getShortNotes,
  getStageBadgeClass,
  getStatusBadgeClass,
} from "@/lib/leads/leadsTableDisplay";
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
import { useDeleteLeadMutation, useGetLeadsQuery } from "@/store/features/leads/leadsApi";
import { dismissToast, showError, showLoading, showSuccess } from "@/utils/toast";

export default function LeadsPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<string>("All");
  const [stage, setStage] = useState<string>("All");
  const [deletingLeadId, setDeletingLeadId] = useState<string | null>(null);
  const [deleteLead] = useDeleteLeadMutation();

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 450);

    return () => window.clearTimeout(timeoutId);
  }, [search]);

  const queryParams = useMemo(
    () => ({
      page,
      limit,
      status: status === "All" ? undefined : status,
      search: debouncedSearch || undefined,
      followUpStage: stage === "All" ? undefined : stage,
    }),
    [page, limit, status, debouncedSearch, stage],
  );

  const { data, isLoading, isError } = useGetLeadsQuery(queryParams);
  const { data: filterSourceData } = useGetLeadsQuery({
    page: 1,
    limit: 50,
  });

  const total = data?.data.pagination.total ?? 0;
  const totalPages = data?.data.pagination.totalPages ?? 1;
  const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);
  const leads = useMemo(() => data?.data.items ?? [], [data?.data.items]);

  const selectionResetParams = useMemo(
    () => ({ page, debouncedSearch, status, stage }),
    [page, debouncedSearch, status, stage],
  );

  const {
    selectedLeadIds,
    selectedIds,
    toggleLeadSelected,
    toggleSelectAllOnPage,
    headerCheckboxState,
    clearSelection,
  } = useLeadsTableRowSelection(leads, selectionResetParams);

  const filterSourceItems = useMemo(
    () => filterSourceData?.data.items ?? [],
    [filterSourceData?.data.items],
  );
  const statusOptions = useMemo(() => {
    const uniqueStatuses = Array.from(
      new Set(filterSourceItems.map((item) => item.status).filter(Boolean)),
    );
    const options = ["All", ...uniqueStatuses];
    if (status !== "All" && !options.includes(status)) {
      options.push(status);
    }
    return options;
  }, [filterSourceItems, status]);
  const stageOptions = useMemo(() => {
    const uniqueStages = Array.from(
      new Set(filterSourceItems.map((item) => item.followUpStage).filter(Boolean)),
    );
    const options = ["All", ...uniqueStages];
    if (stage !== "All" && !options.includes(stage)) {
      options.push(stage);
    }
    return options;
  }, [filterSourceItems, stage]);
  
  const visiblePageNumbers = useMemo(() => {
    const maxVisiblePages = 5;
    const start = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    const end = Math.min(totalPages, start + maxVisiblePages - 1);
    const adjustedStart = Math.max(1, end - maxVisiblePages + 1);

    return Array.from({ length: end - adjustedStart + 1 }, (_, index) => adjustedStart + index);
  }, [page, totalPages]);

  const handleDeleteLead = async (leadId: string) => {
    const loadingToastId = showLoading("Deleting lead...");
    setDeletingLeadId(leadId);

    try {
      const response = await deleteLead(leadId).unwrap();
      showSuccess(response.message || "Lead deleted successfully");
    } catch (error: unknown) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        "Failed to delete lead. Please try again.";
      showError(errorMessage);
    } finally {
      dismissToast(loadingToastId);
      setDeletingLeadId(null);
    }
  };

  return (
    <div className="w-full min-w-0 space-y-4 overflow-x-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          {/* <p className="text-sm text-slate-500">Follow Up Dashboard</p> */}
          <h2 className="flex items-center gap-2 text-3xl font-semibold text-slate-900">
            <Users2 className="h-7 w-7 text-indigo-600" />
            Leads
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <ImportLeadsDialog
            trigger={
              <Button variant="outline" className="gap-2">
                <Upload className="h-4 w-4" />
                Import CSV
              </Button>
            }
          />
          <AddLeadDialog
            trigger={
              <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                <Plus className="h-4 w-4" />
                Add Lead
              </Button>
            }
          />
        </div>
      </div>

      <div className="w-full min-w-0 rounded-xl border bg-white p-4 shadow-sm">
        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-12">
          <div className="relative md:col-span-8">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(event) => {
                setPage(1);
                setSearch(event.target.value);
              }}
              placeholder="Search name, email, company..."
              className="pl-10"
            />
          </div>

          <div className="md:col-span-2">
            <Select
              value={status}
              onValueChange={(value) => {
                setPage(1);
                setStatus(value);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status: All" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2">
            <Select
              value={stage}
              onValueChange={(value) => {
                setPage(1);
                setStage(value);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Stage: All" />
              </SelectTrigger>
              <SelectContent>
                {stageOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <LeadsBulkSelectionToolbar selectedIds={selectedIds} onDeleted={clearSelection} />

        {isLoading ? (
          <div className="rounded-md border border-dashed p-8 text-center text-slate-500">
            Loading leads...
          </div>
        ) : isError ? (
          <div className="rounded-md border border-red-200 bg-red-50 p-8 text-center text-red-600">
            Failed to fetch leads.
          </div>
        ) : leads.length === 0 ? (
          <div className="rounded-md border border-dashed p-8 text-center">
            <h3 className="text-lg font-semibold text-slate-900">No leads found</h3>
            <p className="mt-1 text-sm text-slate-500">
              Try changing filters or search keyword to find lead data.
            </p>
          </div>
        ) : (
          <>
            <div className="w-full max-w-full overflow-x-auto">
              <Table className="min-w-[1240px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12 pr-2">
                      <Checkbox
                        aria-label="Select all leads on this page"
                        checked={headerCheckboxState}
                        onCheckedChange={(value) => toggleSelectAllOnPage(value === true)}
                        disabled={leads.length === 0}
                      />
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>FollowUp Stage</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead className="text-center">Add Transcript</TableHead>
                    <TableHead className="text-center">Update</TableHead>
                    <TableHead className="text-center">Delete</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="w-12 pr-2 align-middle">
                        <Checkbox
                          aria-label={`Select ${lead.name}`}
                          checked={selectedLeadIds.has(lead.id)}
                          onCheckedChange={(value) => toggleLeadSelected(lead.id, value === true)}
                        />
                      </TableCell>
                      <TableCell className="">
                        <div className="flex flex-col gap-y-0.5">
                          <h3 className="font-medium">{lead.name}</h3>
                            <span className="flex items-center gap-x-1 text-sm"><Building2 className="h-3 w-3" /> {lead.company || "---"}</span>
                        </div>

                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-y-0.5">
                          <span className="flex items-center gap-x-1 text-sm"><Mail className="h-3 w-3" /> {lead.email || "---"}</span>
                          <span className="flex items-center gap-x-1 text-sm"><Phone className="h-3 w-3" /> {lead.phone || "---"}</span>
                        </div>
                      </TableCell>
                      <TableCell>{lead.location || "---"}</TableCell>
                      <TableCell className="max-w-[220px]">
                        {lead.notes ? (
                          <TooltipProvider delayDuration={150}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <p className="cursor-help truncate text-sm text-slate-700">
                                  {getShortNotes(lead.notes)}
                                </p>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs whitespace-pre-wrap break-words">
                                {lead.notes}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          "---"
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStageBadgeClass(lead.followUpStage)}>
                          {lead.followUpStage}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusBadgeClass(lead.status)}>
                          {lead.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-slate-600">
                        {formatLeadAddedAt(lead.createdAt)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button asChild variant="ghost" size="sm" className="gap-2 text-indigo-600 hover:text-indigo-700">
                          <Link to={`/dashboard/leads/${lead.id}/transcripts`}>
                            <FileText className="h-4 w-4" />
                            Add
                          </Link>
                        </Button>
                      </TableCell>
                      <TableCell className="text-center">
                        <UpdateLeadDialog
                          leadId={lead.id}
                          trigger={
                            <Button variant="ghost" size="icon" className="text-indigo-600 hover:text-indigo-700">
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Update lead</span>
                            </Button>
                          }
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-rose-600 hover:text-rose-700"
                              disabled={deletingLeadId === lead.id}
                            >
                              {deletingLeadId === lead.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                              <span className="sr-only">Delete lead</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete lead?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete{" "}
                                <span className="font-medium text-foreground">{lead.name}</span>.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-rose-600 text-white hover:bg-rose-700"
                                onClick={() => handleDeleteLead(lead.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 flex flex-col items-center justify-between gap-3 border-t pt-3 text-sm text-slate-600 md:flex-row">
              <p>
                Showing {startItem}-{endItem} of {total}
              </p>

              <Pagination className="mx-0 w-auto max-w-full justify-end overflow-x-auto">
                <PaginationContent className="shrink-0">
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(event) => {
                        event.preventDefault();
                        if (page > 1) setPage((prev) => prev - 1);
                      }}
                    />
                  </PaginationItem>

                  {visiblePageNumbers.map((pageNumber) => (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        href="#"
                        isActive={pageNumber === page}
                        onClick={(event) => {
                          event.preventDefault();
                          setPage(pageNumber);
                        }}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(event) => {
                        event.preventDefault();
                        if (page < totalPages) setPage((prev) => prev + 1);
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
