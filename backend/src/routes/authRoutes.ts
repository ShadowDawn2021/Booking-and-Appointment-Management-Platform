// src/routes/authRoutes.ts
import { Router } from "express";
import {
  loginHandler,
  meHandler,
  signupHandler,
} from "../controllers/authController.js";
import { requireAuth } from "../middleware/requireAuth.js";

export const authRouter = Router();

authRouter.post("/signup", signupHandler);
authRouter.post("/login", loginHandler);
authRouter.get("/me", requireAuth, meHandler);
