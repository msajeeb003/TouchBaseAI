import prisma from "../../shared/prisma";
import AppError from "../../shared/errors/AppError";
import { hashPassword, comparePassword, generateToken } from "./auth.utils";

const excludePassword = <T extends { passwordHash: string }>(
  user: T
): Omit<T, "passwordHash"> => {
  const { passwordHash, ...rest } = user;
  return rest;
};

const register = async (payload: { email: string; password: string }) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (existingUser) {
    throw new AppError(409, "Email already registered");
  }

  const passwordHash = await hashPassword(payload.password);

  const user = await prisma.user.create({
    data: {
      email: payload.email,
      passwordHash,
    },
  });

  await prisma.userSettings.create({
    data: { userId: user.id },
  });

  const accessToken = generateToken({
    userId: user.id,
    email: user.email,
  });

  return {
    accessToken,
    user: excludePassword(user),
  };
};

const login = async (payload: { email: string; password: string }) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user) {
    throw new AppError(401, "Invalid email or password");
  }

  const isPasswordValid = await comparePassword(
    payload.password,
    user.passwordHash
  );

  if (!isPasswordValid) {
    throw new AppError(401, "Invalid email or password");
  }

  const accessToken = generateToken({
    userId: user.id,
    email: user.email,
  });

  return {
    accessToken,
    user: excludePassword(user),
  };
};

export const AuthService = {
  register,
  login,
};
