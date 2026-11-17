import { Router } from "express";
import { listSlotsHandler } from "../controllers/slotController.js";
import {
  createProviderHandler,
  getMyProviderHandler,
  getProviderBySlugHandler,
  listProviderServicesHandler,
  updateMyProviderHandler,
} from "../controllers/providerController.js";
import { requireAuth, requireRole } from "../middleware/requireAuth.js";

export const providerRouter = Router();

providerRouter.post(
  "/",
  requireAuth,
  requireRole("PROVIDER"),
  createProviderHandler,
);
providerRouter.get(
  "/me",
  requireAuth,
  requireRole("PROVIDER"),
  getMyProviderHandler,
);
providerRouter.patch(
  "/me",
  requireAuth,
  requireRole("PROVIDER"),
  updateMyProviderHandler,
);
providerRouter.get("/:slug", getProviderBySlugHandler);
providerRouter.get("/:slug/services", listProviderServicesHandler);
providerRouter.get("/:slug/slots", listSlotsHandler);
