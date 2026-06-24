import { Response } from "express";
import { AuthRequest } from "../../shared/middleware/auth";
import catchAsync from "../../shared/utils/catchAsync";
import sendResponse from "../../shared/utils/sendResponse";
import { PromptTemplateService } from "./prompt-template.service";

const createTemplate = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const result = await PromptTemplateService.createTemplate(
      req.user!.id,
      req.body
    );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Prompt template created successfully",
      data: result,
    });
  }
);

const getTemplates = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const result = await PromptTemplateService.getTemplates(req.user!.id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Prompt templates fetched successfully",
      data: result,
    });
  }
);

const getTemplateById = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const result = await PromptTemplateService.getTemplateById(
      req.user!.id,
      req.params.id as string
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Prompt template fetched successfully",
      data: result,
    });
  }
);

const updateTemplate = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const result = await PromptTemplateService.updateTemplate(
      req.user!.id,
      req.params.id as string,
      req.body
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Prompt template updated successfully",
      data: result,
    });
  }
);

const generatePromptText = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const result = await PromptTemplateService.generatePromptText(
      req.user!.id,
      req.body
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Prompt text generated successfully",
      data: result,
    });
  }
);

const deleteTemplate = catchAsync(
  async (req: AuthRequest, res: Response) => {
    await PromptTemplateService.deleteTemplate(
      req.user!.id,
      req.params.id as string
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Prompt template deleted successfully",
      data: null,
    });
  }
);

export const PromptTemplateController = {
  createTemplate,
  getTemplates,
  getTemplateById,
  updateTemplate,
  deleteTemplate,
  generatePromptText,
};
