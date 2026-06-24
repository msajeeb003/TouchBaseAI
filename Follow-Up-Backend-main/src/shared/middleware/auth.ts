import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../../modules/auth/auth.utils";
import AppError from "../errors/AppError";
import prisma from "../prisma";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

const auth = async (req: AuthRequest, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError(401, "No token provided");
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true },
    });

    if (!user) {
      throw new AppError(401, "User not found");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError(401, "Invalid or expired token"));
    }
  }
};

export default auth;
