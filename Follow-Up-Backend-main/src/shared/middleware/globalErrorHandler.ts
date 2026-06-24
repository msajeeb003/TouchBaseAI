import { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import config from "../../config";
import AppError from "../errors/AppError";

const globalErrorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  let statusCode = 500;
  let message = "Something went wrong!";
  let errorDetails: Record<string, unknown>[] = [];

  if (err instanceof ZodError) {
    statusCode = 400;
    errorDetails = err.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }));
    message = errorDetails.map((e) => e.message).join(", ");
  } else if (
    err instanceof PrismaClientKnownRequestError &&
    err.code === "P2002"
  ) {
    statusCode = 409;
    const target = (err.meta?.target as string[]) || [];
    message = `${target.join(", ")} already exists`;
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof Error) {
    message = err.message;
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errorDetails: errorDetails.length > 0 ? errorDetails : undefined,
    stack: config.env === "development" ? err?.stack : undefined,
  });
};

export default globalErrorHandler;
