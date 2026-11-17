import { Router } from "express";
import {
  deleteExceptionHandler,
  getMyAvailabilityHandler,
  replaceWeeklyHandler,
  upsertExceptionHandler,
} from "../controllers/availabilityController.js";
import { requireAuth, requireRole } from "../middleware/requireAuth.js";

export const availabilityRouter = Router();

availabilityRouter.use(requireAuth, requireRole("PROVIDER"));
availabilityRouter.get("/me", getMyAvailabilityHandler);
availabilityRouter.put("/me/weekly", replaceWeeklyHandler);
availabilityRouter.put("/me/exceptions", upsertExceptionHandler);
availabilityRouter.delete("/me/exceptions/:id", deleteExceptionHandler);
