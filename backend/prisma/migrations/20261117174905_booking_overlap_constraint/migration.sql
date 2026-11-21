-- DropIndex
DROP INDEX "Booking_providerId_startTime_key";

-- CreateIndex
CREATE INDEX "Booking_providerId_startTime_idx" ON "Booking"("providerId", "startTime");
