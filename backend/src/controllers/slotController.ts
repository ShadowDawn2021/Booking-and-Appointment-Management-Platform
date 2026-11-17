import type { Request, Response } from "express";
import { getAvailableSlots } from "../services/slotServices.js";
import { slotsQuerySchema, slugParamSchema } from "../utils/validation.js";

export async function listSlotsHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const { slug } = slugParamSchema.parse(req.params);
  res.json(await getAvailableSlots(slug, slotsQuerySchema.parse(req.query)));
}
