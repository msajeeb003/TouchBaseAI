import { Response } from "express";
import { AuthRequest } from "../../shared/middleware/auth";
import catchAsync from "../../shared/utils/catchAsync";
import sendResponse from "../../shared/utils/sendResponse";
import { LeadTranscriptService } from "./lead-transcript.service";

const createTranscript = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const result = await LeadTranscriptService.createTranscript(
      req.user!.id,
      req.params.leadId as string,
      req.body
    );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Transcript added successfully",
      data: result,
    });
  }
);

const getTranscripts = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const result = await LeadTranscriptService.getTranscripts(
      req.user!.id,
      req.params.leadId as string
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Transcripts fetched successfully",
      data: result,
    });
  }
);

const getTranscriptById = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const result = await LeadTranscriptService.getTranscriptById(
      req.user!.id,
      req.params.leadId as string,
      req.params.id as string
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Transcript fetched successfully",
      data: result,
    });
  }
);

const updateTranscript = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const result = await LeadTranscriptService.updateTranscript(
      req.user!.id,
      req.params.leadId as string,
      req.params.id as string,
      req.body
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Transcript updated successfully",
      data: result,
    });
  }
);

const deleteTranscript = catchAsync(
  async (req: AuthRequest, res: Response) => {
    await LeadTranscriptService.deleteTranscript(
      req.user!.id,
      req.params.leadId as string,
      req.params.id as string
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Transcript deleted successfully",
      data: null,
    });
  }
);

const importFromFathom = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const result = await LeadTranscriptService.importFromFathom(
      req.user!.id,
      req.params.leadId as string,
      req.body
    );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Fathom transcript imported successfully",
      data: result,
    });
  }
);

export const LeadTranscriptController = {
  createTranscript,
  getTranscripts,
  getTranscriptById,
  updateTranscript,
  deleteTranscript,
  importFromFathom,
};
