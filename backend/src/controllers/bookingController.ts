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

export async function createBookingHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const { userId } = getAuth(req);
  res
    .status(201)
    .json(await createBooking(userId, createBookingSchema.parse(req.body)));
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
  const { id } = idParamSchema.parse(req.params);
  res.json(await cancelBooking(getAuth(req), id));
}
