/*
  Warnings:

  - A unique constraint covering the columns `[propertyId,startDate,endDate]` on the table `Reservation` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "Reservation_userId_idx" ON "Reservation"("userId");

-- CreateIndex
CREATE INDEX "Reservation_propertyId_idx" ON "Reservation"("propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_propertyId_startDate_endDate_key" ON "Reservation"("propertyId", "startDate", "endDate");
