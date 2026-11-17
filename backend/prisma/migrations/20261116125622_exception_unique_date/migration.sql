/*
  Warnings:

  - A unique constraint covering the columns `[providerId,date]` on the table `AvailabilityException` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "AvailabilityException_providerId_date_key" ON "AvailabilityException"("providerId", "date");
