import { Response } from "express";
import { AuthRequest } from "../../shared/middleware/auth";
import catchAsync from "../../shared/utils/catchAsync";
import sendResponse from "../../shared/utils/sendResponse";
import { ActivityService } from "./activity.service";

const getCalls = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await ActivityService.getCalls(req.user!.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Calls fetched successfully",
    data: result,
  });
});

const getMessages = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await ActivityService.getMessages(req.user!.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Messages fetched successfully",
    data: result,
  });
});

export const ActivityController = { getCalls, getMessages };
