// src/middleware/requireAuth.ts
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { AuthTokenPayload } from "../services/authServices.js";
import { config } from "../utils/config.js";
import { HttpError } from "../utils/httpError.js";

declare global {
  namespace Express {
    interface Request {
      auth?: AuthTokenPayload;
    }
  }
}

function isAuthTokenPayload(value: unknown): value is AuthTokenPayload {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.userId === "string" &&
    (candidate.role === "PROVIDER" || candidate.role === "CUSTOMER")
  );
}

export function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const [scheme, token] = (req.headers.authorization ?? "").split(" ");
  if (scheme !== "Bearer" || !token) {
    throw new HttpError(401, "Missing or malformed Authorization header");
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    if (!isAuthTokenPayload(decoded)) {
      throw new HttpError(401, "Invalid token payload");
    }
    req.auth = decoded;
    next();
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(401, "Invalid or expired token");
  }
}

export function requireRole(role: AuthTokenPayload["role"]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (req.auth?.role !== role) {
      throw new HttpError(403, "Forbidden");
    }
    next();
  };
}
