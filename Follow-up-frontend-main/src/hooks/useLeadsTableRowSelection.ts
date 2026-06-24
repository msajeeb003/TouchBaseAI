import { useCallback, useEffect, useMemo, useState } from "react";
import type { LeadItem } from "@/types/leads";

export interface LeadsTableSelectionResetParams {
  page: number;
  debouncedSearch: string;
  status: string;
  stage: string;
}

export function useLeadsTableRowSelection(
  leads: LeadItem[],
  resetParams: LeadsTableSelectionResetParams,
) {
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    setSelectedLeadIds(new Set());
  }, [resetParams.page, resetParams.debouncedSearch, resetParams.status, resetParams.stage]);

  useEffect(() => {
    const validIds = new Set(leads.map((l) => l.id));
    setSelectedLeadIds((prev) => {
      let changed = false;
      const next = new Set<string>();
      prev.forEach((id) => {
        if (validIds.has(id)) next.add(id);
        else changed = true;
      });
      return changed ? next : prev;
    });
  }, [leads]);

  const selectedIds = useMemo(() => Array.from(selectedLeadIds), [selectedLeadIds]);

  const toggleLeadSelected = useCallback((leadId: string, checked: boolean) => {
    setSelectedLeadIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(leadId);
      else next.delete(leadId);
      return next;
    });
  }, []);

  const toggleSelectAllOnPage = useCallback(
    (checked: boolean) => {
      setSelectedLeadIds((prev) => {
        const next = new Set(prev);
        if (checked) {
          leads.forEach((lead) => next.add(lead.id));
        } else {
          leads.forEach((lead) => next.delete(lead.id));
        }
        return next;
      });
    },
    [leads],
  );

  const headerCheckboxState = useMemo((): boolean | "indeterminate" => {
    const allSelected = leads.length > 0 && leads.every((lead) => selectedLeadIds.has(lead.id));
    const someSelected = leads.some((lead) => selectedLeadIds.has(lead.id));
    if (allSelected) return true;
    if (someSelected) return "indeterminate";
    return false;
  }, [leads, selectedLeadIds]);

  const clearSelection = useCallback(() => {
    setSelectedLeadIds(new Set());
  }, []);

  return {
    selectedLeadIds,
    selectedIds,
    selectedCount: selectedIds.length,
    toggleLeadSelected,
    toggleSelectAllOnPage,
    headerCheckboxState,
    clearSelection,
  };
}
