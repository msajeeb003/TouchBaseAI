import { Response } from "express";
import { AuthRequest } from "../../shared/middleware/auth";
import catchAsync from "../../shared/utils/catchAsync";
import sendResponse from "../../shared/utils/sendResponse";
import { SettingsService } from "./settings.service";

const getSettings = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const result = await SettingsService.getSettings(req.user!.id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Settings retrieved successfully",
      data: result,
    });
  }
);

const updateSettings = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const result = await SettingsService.updateSettings(
      req.user!.id,
      req.body
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Settings updated successfully",
      data: result,
    });
  }
);

export const SettingsController = {
  getSettings,
  updateSettings,
};
