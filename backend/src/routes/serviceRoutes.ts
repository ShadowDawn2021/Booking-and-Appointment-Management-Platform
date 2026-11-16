import { Router } from "express";
import {
  createServiceHandler,
  deleteServiceHandler,
  updateServiceHandler,
} from "../controllers/serviceController.js";
import { requireAuth, requireRole } from "../middleware/requireAuth.js";

export const serviceRouter = Router();

serviceRouter.use(requireAuth, requireRole("PROVIDER"));
serviceRouter.post("/", createServiceHandler);
serviceRouter.patch("/:id", updateServiceHandler);
serviceRouter.delete("/:id", deleteServiceHandler);
