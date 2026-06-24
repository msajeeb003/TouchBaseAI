import { Response } from "express";
import { AuthRequest } from "../../shared/middleware/auth";
import catchAsync from "../../shared/utils/catchAsync";
import sendResponse from "../../shared/utils/sendResponse";
import { DashboardService } from "./dashboard.service";

const getDashboard = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await DashboardService.getDashboard(req.user!.id, {
    days: req.query.days ? Number(req.query.days) : undefined,
    upcomingDays: req.query.upcomingDays
      ? Number(req.query.upcomingDays)
      : undefined,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Dashboard data fetched successfully",
    data: result,
  });
});

export const DashboardController = { getDashboard };
