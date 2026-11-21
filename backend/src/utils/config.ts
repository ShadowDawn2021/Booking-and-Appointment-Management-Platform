import "dotenv/config";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set`);
  }
  return value;
}

type EmailConfig =
  | { provider: "console" }
  | { provider: "resend"; apiKey: string; from: string };

function loadEmailConfig(): EmailConfig {
  const provider = process.env.EMAIL_PROVIDER ?? "console";
  if (provider === "console") {
    return { provider };
  }
  if (provider === "resend") {
    return {
      provider,
      apiKey: requireEnv("RESEND_API_KEY"),
      from: requireEnv("EMAIL_FROM"),
    };
  }
  throw new Error('EMAIL_PROVIDER must be "console" or "resend"');
}

export const config = {
  jwtSecret: requireEnv("JWT_SECRET"),
  port: Number(process.env.PORT) || 4000,
  email: loadEmailConfig(),
};
