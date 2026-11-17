import type { Request, Response } from "express";
import { getAuth } from "../middleware/requireAuth.js";
import {
  deleteException,
  getAvailability,
  replaceWeeklyAvailability,
  upsertException,
} from "../services/availabilityServices.js";
import { getProviderByUserId } from "../services/providerServices.js";
import {
  exceptionSchema,
  idParamSchema,
  weeklyAvailabilitySchema,
} from "../utils/validation.js";

export async function getMyAvailabilityHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const provider = await getProviderByUserId(getAuth(req).userId);
  res.json(await getAvailability(provider.id));
}

export async function replaceWeeklyHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const provider = await getProviderByUserId(getAuth(req).userId);
  res.json(
    await replaceWeeklyAvailability(
      provider.id,
      weeklyAvailabilitySchema.parse(req.body),
    ),
  );
}

export async function upsertExceptionHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const provider = await getProviderByUserId(getAuth(req).userId);
  res.json(await upsertException(provider.id, exceptionSchema.parse(req.body)));
}

export async function deleteExceptionHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const provider = await getProviderByUserId(getAuth(req).userId);
  const { id } = idParamSchema.parse(req.params);
  await deleteException(provider.id, id);
  res.status(204).end();
}
