export interface LeadItem {
  id: string;
  userId: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  location?: string;
  status: string;
  followUpStage: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeadsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface LeadsCollection {
  items: LeadItem[];
  pagination: LeadsPagination;
}

export interface GetLeadsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: LeadsCollection;
}

export interface GetLeadsQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  followUpStage?: string;
}

export interface CreateLeadRequestBody {
  name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  location?: string | null;
  followUpStage?: string | null;
  notes?: string | null;
}

export interface CreateLeadResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: LeadItem;
}

export interface GetSingleLeadResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: LeadItem;
}

export interface UpdateLeadRequestBody {
  name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  location?: string | null;
  followUpStage?: string | null;
  notes?: string | null;
}

export interface UpdateLeadResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: LeadItem;
}

export interface DeleteLeadResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: null;
}

export interface BulkDeleteLeadsRequestBody {
  leadIds: string[];
}

export interface BulkDeleteLeadsResult {
  deletedCount: number;
  requestedCount: number;
  skippedCount: number;
}

export interface BulkDeleteLeadsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: BulkDeleteLeadsResult;
}

export interface LeadImportErrorItem {
  row: number;
  email: string;
  reason: string;
}

export interface ImportLeadsCsvData {
  total: number;
  success: number;
  failed: number;
  errors: LeadImportErrorItem[];
  /** CSV header → lead field (e.g. "Contact Name" → "name"). */
  columnMapping: Record<string, string>;
}

export interface ImportLeadsCsvResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: ImportLeadsCsvData;
}
