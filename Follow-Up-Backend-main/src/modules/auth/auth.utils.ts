import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../../config";

const SALT_ROUNDS = 12;

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateToken = (payload: {
  userId: string;
  email: string;
}): string => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expires_in as jwt.SignOptions["expiresIn"],
  });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, config.jwt.secret) as {
    userId: string;
    email: string;
    iat: number;
    exp: number;
  };
};
