import { config } from "../utils/config.js";
import { ConsoleEmailSender, type EmailSender } from "./emailSender.js";
import { ResendEmailSender } from "./resendEmailSender.js";

export const emailSender: EmailSender =
  config.email.provider === "resend"
    ? new ResendEmailSender(config.email.apiKey, config.email.from)
    : new ConsoleEmailSender();
