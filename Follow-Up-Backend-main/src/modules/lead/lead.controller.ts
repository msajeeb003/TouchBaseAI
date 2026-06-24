import { Response } from "express";
import { AuthRequest } from "../../shared/middleware/auth";
import catchAsync from "../../shared/utils/catchAsync";
import sendResponse from "../../shared/utils/sendResponse";
import AppError from "../../shared/errors/AppError";
import { LeadService } from "./lead.service";

const createLead = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await LeadService.createLead(req.user!.id, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Lead created successfully",
    data: result,
  });
});

const getLeads = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await LeadService.getLeads(req.user!.id, {
    page: req.query.page ? Number(req.query.page) : undefined,
    limit: req.query.limit ? Number(req.query.limit) : undefined,
    status: req.query.status as string | undefined,
    search: req.query.search as string | undefined,
    followUpStage: req.query.followUpStage as string | undefined,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Leads fetched successfully",
    data: result,
  });
});

const getLeadById = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await LeadService.getLeadById(
    req.user!.id,
    req.params.id as string
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Lead fetched successfully",
    data: result,
  });
});

const updateLead = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await LeadService.updateLead(
    req.user!.id,
    req.params.id as string,
    req.body
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Lead updated successfully",
    data: result,
  });
});

const deleteLead = catchAsync(async (req: AuthRequest, res: Response) => {
  await LeadService.deleteLead(req.user!.id, req.params.id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Lead deleted successfully",
    data: null,
  });
});

const deleteManyLeads = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await LeadService.deleteManyLeads(req.user!.id, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: `${result.deletedCount} lead(s) deleted`,
    data: result,
  });
});

const importCSV = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    throw new AppError(400, "CSV file is required");
  }

  // console.log(req.file);
  // return


  const result = await LeadService.importCSV(req.user!.id, req.file.buffer);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: `Import complete: ${result.success} added, ${result.failed} failed`,
    data: result,
  });
});

export const LeadController = {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
  deleteManyLeads,
  importCSV,
};
