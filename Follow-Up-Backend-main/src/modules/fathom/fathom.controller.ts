import { Response } from "express";
import { AuthRequest } from "../../shared/middleware/auth";
import catchAsync from "../../shared/utils/catchAsync";
import sendResponse from "../../shared/utils/sendResponse";
import { FathomService } from "./fathom.service";

const getMeetings = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await FathomService.getMeetings(req.user!.id, {
    cursor: req.query.cursor as string | undefined,
    include_summary: req.query.include_summary as string | undefined,
    include_transcript: req.query.include_transcript as string | undefined,
    include_action_items: req.query.include_action_items as string | undefined,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Meetings fetched successfully",
    data: result,
  });
});

const getTranscript = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await FathomService.getTranscript(
    req.user!.id,
    req.params.recordingId as string
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Transcript fetched successfully",
    data: result,
  });
});

const getSummary = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await FathomService.getSummary(
    req.user!.id,
    req.params.recordingId as string
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Summary fetched successfully",
    data: result,
  });
});

export const FathomController = {
  getMeetings,
  getTranscript,
  getSummary,
};
