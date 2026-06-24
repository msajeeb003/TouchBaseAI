import { Request, Response } from "express";

const notFound = (_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: "API Not Found!",
  });
};

export default notFound;
