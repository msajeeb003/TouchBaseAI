import express, { Request, Response } from "express";
import cors from "cors";
import router from "./app/routes";
import globalErrorHandler from "./shared/middleware/globalErrorHandler";
import notFound from "./shared/middleware/notFound";

const app = express();

// CORS — allow the configured frontend origins. Set CORS_ORIGINS as a
// comma-separated list in production (e.g. your deployed frontend URL).
// Falls back to local dev + the known Vercel deployment when unset.
const DEFAULT_CORS_ORIGINS = [
  "http://localhost:8080",
  "http://localhost:5173",
  "https://follow-up-agent-mu.vercel.app",
];
const allowedOrigins = (
  process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(",").map((origin) => origin.trim())
    : DEFAULT_CORS_ORIGINS
).filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser clients (curl, server-to-server) with no Origin header.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  })
);

// parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// root route
app.get("/", (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Follow Up API is running 🚀",
  });
});

// api routes
app.use("/api/v1", router);

// global error handler
app.use(globalErrorHandler);

// 404 handler
app.use(notFound);

export default app;
