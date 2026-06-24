import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const config = {
  port: Number(process.env.PORT) || 5000,
  env: process.env.NODE_ENV || "development",
  database_url: process.env.DATABASE_URL as string,
  jwt: {
    secret: process.env.JWT_SECRET as string,
    expires_in: process.env.JWT_EXPIRES_IN || "7d",
  },
  encryption_key: process.env.ENCRYPTION_KEY as string,
  batch_size: Number(process.env.BATCH_SIZE) || 20,
  /** Public HTTPS base URL for Twilio StatusCallback (e.g. ngrok: https://abc.ngrok-free.app) */
  public_base_url: process.env.PUBLIC_BASE_URL?.replace(/\/$/, "") || "",
};

export default config;
