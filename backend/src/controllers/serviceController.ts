import type { Request, Response } from "express";
import { getAuth } from "../middleware/requireAuth.js";
import { getProviderByUserId } from "../services/providerServices.js";
import {
  createService,
  deleteService,
  updateService,
} from "../services/serviceCatalogServices.js";
import {
  idParamSchema,
  serviceSchema,
  updateServiceSchema,
} from "../utils/validation.js";

export async function createServiceHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const provider = await getProviderByUserId(getAuth(req).userId);
  res
    .status(201)
    .json(await createService(provider.id, serviceSchema.parse(req.body)));
}

export async function updateServiceHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const provider = await getProviderByUserId(getAuth(req).userId);
  const { id } = idParamSchema.parse(req.params);
  res.json(
    await updateService(provider.id, id, updateServiceSchema.parse(req.body)),
  );
}

export async function deleteServiceHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const provider = await getProviderByUserId(getAuth(req).userId);
  const { id } = idParamSchema.parse(req.params);
  await deleteService(provider.id, id);
  res.status(204).end();
}
