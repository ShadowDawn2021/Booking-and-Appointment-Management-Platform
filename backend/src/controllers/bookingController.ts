import type { Request, Response } from "express";
import { getAuth } from "../middleware/requireAuth.js";
import {
  cancelBooking,
  createBooking,
  listBookings,
} from "../services/bookingServices.js";
import {
  createBookingSchema,
  idParamSchema,
  listBookingsQuerySchema,
} from "../utils/validation.js";

import {
  notifyBookingCancelled,
  notifyBookingCreated,
} from "../services/notificationServices.js";
import { runInBackground } from "../utils/background.js";

export async function createBookingHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const { userId } = getAuth(req);
  const booking = await createBooking(
    userId,
    createBookingSchema.parse(req.body),
  );
  runInBackground(notifyBookingCreated(booking.id), "booking-created email");
  res.status(201).json(booking);
}

export async function listMyBookingsHandler(
  req: Request,
  res: Response,
): Promise<void> {
  res.json(
    await listBookings(getAuth(req), listBookingsQuerySchema.parse(req.query)),
  );
}

export async function cancelBookingHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const auth = getAuth(req);
  const { id } = idParamSchema.parse(req.params);
  const booking = await cancelBooking(auth, id);
  runInBackground(
    notifyBookingCancelled(booking.id, auth.role),
    "booking-cancelled email",
  );
  res.json(booking);
}
