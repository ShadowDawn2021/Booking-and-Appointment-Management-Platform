import type { Request, Response } from "express";
import { getAuth } from "../middleware/requireAuth.js";
import {
  createProvider,
  getProviderByUserId,
  getPublicProviderBySlug,
  updateProvider,
} from "../services/providerServices.js";
import { listServicesBySlug } from "../services/serviceCatalogServices.js";
import {
  createProviderSchema,
  slugParamSchema,
  updateProviderSchema,
} from "../utils/validation.js";

export async function createProviderHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const { userId } = getAuth(req);
  const provider = await createProvider(
    userId,
    createProviderSchema.parse(req.body),
  );
  res.status(201).json(provider);
}

export async function getMyProviderHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const { userId } = getAuth(req);
  res.json(await getProviderByUserId(userId));
}

export async function updateMyProviderHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const { userId } = getAuth(req);
  res.json(await updateProvider(userId, updateProviderSchema.parse(req.body)));
}

export async function getProviderBySlugHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const { slug } = slugParamSchema.parse(req.params);
  res.json(await getPublicProviderBySlug(slug));
}

export async function listProviderServicesHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const { slug } = slugParamSchema.parse(req.params);
  res.json(await listServicesBySlug(slug));
}
