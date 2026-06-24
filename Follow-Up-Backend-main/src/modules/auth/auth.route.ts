import { Router } from "express";
import { AuthController } from "./auth.controller";
import validateRequest from "../../shared/middleware/validateRequest";
import { registerSchema, loginSchema } from "./auth.validation";

const router = Router();

router.post(
  "/register",
  validateRequest(registerSchema),
  AuthController.register
);

router.post("/login", validateRequest(loginSchema), AuthController.login);

export const AuthRoutes = router;
