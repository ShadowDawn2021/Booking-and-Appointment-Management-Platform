// src/utils/config.ts
import "dotenv/config";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set`);
  }
  return value;
}

export const config = {
  jwtSecret: requireEnv("JWT_SECRET"),
  port: Number(process.env.PORT) || 4000,
};
