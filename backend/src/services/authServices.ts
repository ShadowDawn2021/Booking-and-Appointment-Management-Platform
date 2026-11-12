// src/services/authServices.ts  (replace the file)
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Prisma, type Role } from "../generated/prisma/client.js";
import { config } from "../utils/config.js";
import { HttpError } from "../utils/httpError.js";
import { prisma } from "../utils/prismaClient.js";
import type { LoginInput, SignupInput } from "../utils/validation.js";

export interface AuthTokenPayload {
  userId: string;
  role: Role;
}

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

interface AuthResult {
  user: PublicUser;
  token: string;
}

const publicUserSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
} as const;

function signToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: "7d" });
}

export async function signup(input: SignupInput): Promise<AuthResult> {
  const passwordHash = await bcrypt.hash(input.password, 12);
  try {
    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        name: input.name,
        role: input.role,
      },
      select: publicUserSelect,
    });
    return { user, token: signToken({ userId: user.id, role: user.role }) };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new HttpError(409, "Email already in use");
    }
    throw error;
  }
}

export async function login(input: LoginInput): Promise<AuthResult> {
  const record = await prisma.user.findUnique({
    where: { email: input.email },
  });
  const passwordMatches = record
    ? await bcrypt.compare(input.password, record.passwordHash)
    : false;

  if (!record || !passwordMatches) {
    throw new HttpError(401, "Invalid credentials");
  }

  const user: PublicUser = {
    id: record.id,
    email: record.email,
    name: record.name,
    role: record.role,
  };
  return { user, token: signToken({ userId: user.id, role: user.role }) };
}
