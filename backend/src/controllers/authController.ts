// src/controllers/authController.ts
import type { Request, Response } from "express";
import { login, signup } from "../services/authServices.js";
import { loginSchema, signupSchema } from "../utils/validation.js";

export async function signupHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const result = await signup(signupSchema.parse(req.body));
  res.status(201).json(result);
}

export async function loginHandler(req: Request, res: Response): Promise<void> {
  const result = await login(loginSchema.parse(req.body));
  res.json(result);
}

export function meHandler(req: Request, res: Response): void {
  res.json({ auth: req.auth });
}
