import { Response } from "express";
import { AuthRequest } from "../../shared/middleware/auth";
import catchAsync from "../../shared/utils/catchAsync";
import sendResponse from "../../shared/utils/sendResponse";
import { SequenceStepService } from "./sequence-step.service";
import { sendStepNow } from "../../shared/services/send-processor";

const createStep = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const result = await SequenceStepService.createStep(
      req.user!.id,
      req.params.sequenceId as string,
      req.body
    );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Step added successfully",
      data: result,
    });
  }
);

const getSteps = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const result = await SequenceStepService.getSteps(
      req.user!.id,
      req.params.sequenceId as string
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Steps fetched successfully",
      data: result,
    });
  }
);

const getStepById = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const result = await SequenceStepService.getStepById(
      req.user!.id,
      req.params.sequenceId as string,
      req.params.stepId as string
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Step fetched successfully",
      data: result,
    });
  }
);

const updateStep = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const result = await SequenceStepService.updateStep(
      req.user!.id,
      req.params.sequenceId as string,
      req.params.stepId as string,
      req.body
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Step updated successfully",
      data: result,
    });
  }
);

const deleteStep = catchAsync(
  async (req: AuthRequest, res: Response) => {
    await SequenceStepService.deleteStep(
      req.user!.id,
      req.params.sequenceId as string,
      req.params.stepId as string
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Step deleted and remaining steps reordered",
      data: null,
    });
  }
);

const reorderSteps = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const result = await SequenceStepService.reorderSteps(
      req.user!.id,
      req.params.sequenceId as string,
      req.body.orderedStepIds as string[]
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Steps reordered successfully",
      data: result,
    });
  }
);

const deleteAllSteps = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const result = await SequenceStepService.deleteAllSteps(
      req.user!.id,
      req.params.sequenceId as string
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `Deleted ${result.deletedCount} step(s)`,
      data: result,
    });
  }
);

const generateStepContent = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const result = await SequenceStepService.generateStepContent(
      req.user!.id,
      req.params.sequenceId as string,
      req.params.stepId as string
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Content generated successfully",
      data: result,
    });
  }
);

const regenerateAllStepsContent = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const result = await SequenceStepService.regenerateAllStepsContent(
      req.user!.id,
      req.params.sequenceId as string
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Bulk step content regeneration finished",
      data: result,
    });
  }
);

const retryStep = catchAsync(
  async (req: AuthRequest, res: Response) => {
    // Send this one step right now and report the outcome.
    const result = await sendStepNow(
      req.user!.id,
      req.params.sequenceId as string,
      req.params.stepId as string
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: result.success ? "Message sent" : "Send failed",
      data: result,
    });
  }
);

export const SequenceStepController = {
  createStep,
  getSteps,
  getStepById,
  updateStep,
  deleteStep,
  reorderSteps,
  deleteAllSteps,
  generateStepContent,
  regenerateAllStepsContent,
  retryStep,
};
