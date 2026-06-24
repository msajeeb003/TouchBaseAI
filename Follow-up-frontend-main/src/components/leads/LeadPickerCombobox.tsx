import { useEffect, useState } from "react";
import { Check, ChevronsUpDown, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useGetLeadsQuery, useGetSingleLeadQuery } from "@/store/features/leads/leadsApi";
import { cn } from "@/lib/utils";

const LEAD_PICKER_PAGE_SIZE = 50;
const SEARCH_DEBOUNCE_MS = 400;

interface LeadPickerComboboxProps {
  value: string;
  onChange: (leadId: string) => void;
  disabled?: boolean;
}

export default function LeadPickerCombobox({
  value,
  onChange,
  disabled = false,
}: LeadPickerComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timeoutId);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const { data: selectedLeadData, isLoading: isSelectedLeadLoading } = useGetSingleLeadQuery(
    value,
    { skip: !value },
  );

  const {
    data: leadsData,
    isLoading,
    isFetching,
  } = useGetLeadsQuery(
    {
      page,
      limit: LEAD_PICKER_PAGE_SIZE,
      search: debouncedSearch || undefined,
    },
    { skip: !open },
  );

  const leads = leadsData?.data.items ?? [];
  const pagination = leadsData?.data.pagination;
  const totalPages = pagination?.totalPages ?? 1;

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setSearch("");
      setDebouncedSearch("");
      setPage(1);
    }
  };

  const selectedLabel = selectedLeadData?.data?.name;
  const triggerLabel = isSelectedLeadLoading
    ? "Loading lead..."
    : selectedLabel || "Select a lead";

  return (
    <Popover modal={false} open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "h-10 w-full justify-between font-normal",
            !value && "text-muted-foreground",
          )}
        >
          <span className="truncate text-left">{triggerLabel}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="z-[100] w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
        onWheel={(e) => e.stopPropagation()}
      >
        <div
          className="flex flex-col overflow-hidden rounded-md border-0 bg-popover text-popover-foreground"
          onWheel={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-2 border-b px-3">
            <Search className="h-4 w-4 shrink-0 opacity-50" aria-hidden />
            <Input
              type="search"
              autoComplete="off"
              placeholder="Search by lead name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 border-0 border-transparent bg-transparent px-0 shadow-none outline-none ring-0 ring-offset-0 focus-visible:border-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          <div
            role="listbox"
            className="max-h-[min(240px,40vh)] overflow-y-auto overscroll-y-contain p-1"
            onWheel={(e) => e.stopPropagation()}
          >
            {isLoading && leads.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Loading leads...</p>
            ) : leads.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No lead found.</p>
            ) : (
              leads.map((lead) => (
                <button
                  key={lead.id}
                  type="button"
                  role="option"
                  aria-selected={value === lead.id}
                  className={cn(
                    "flex w-full cursor-default items-center rounded-sm px-2 py-2 text-left text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                    value === lead.id && "bg-accent text-accent-foreground",
                  )}
                  onClick={() => {
                    onChange(lead.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 shrink-0",
                      value === lead.id ? "opacity-100" : "opacity-0",
                    )}
                    aria-hidden
                  />
                  <div className="flex min-w-0 flex-1 flex-row flex-wrap items-center gap-x-1 text-left">
                    <span className="font-medium">
                      {lead.name} <sup className="text-slate-500">name</sup>
                    </span>
                    {lead.followUpStage ? (
                      <>
                        <Plus className="mx-1 h-4 w-4 shrink-0 text-slate-400" />
                        <span className="text-xs text-blue-700">
                          {lead.followUpStage}{" "}
                          <sup className="text-blue-500">followUpStage</sup>
                        </span>
                      </>
                    ) : null}
                  </div>
                </button>
              ))
            )}
          </div>
          {totalPages > 1 ? (
            <div className="flex items-center justify-between gap-2 border-t px-2 py-1.5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                disabled={page <= 1 || isFetching}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Prev
              </Button>
              <span className="text-xs text-muted-foreground tabular-nums">
                {page} / {totalPages}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                disabled={page >= totalPages || isFetching}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  );
}
