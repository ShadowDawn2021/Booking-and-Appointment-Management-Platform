import { Router } from "express";
import {
  cancelBookingHandler,
  createBookingHandler,
  listMyBookingsHandler,
} from "../controllers/bookingController.js";
import { requireAuth, requireRole } from "../middleware/requireAuth.js";

export const bookingRouter = Router();

bookingRouter.use(requireAuth);
bookingRouter.post("/", requireRole("CUSTOMER"), createBookingHandler);
bookingRouter.get("/me", listMyBookingsHandler); // customers: their bookings, providers: bookings with them
bookingRouter.patch("/:id/cancel", cancelBookingHandler);
