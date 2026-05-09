/*
  Warnings:

  - A unique constraint covering the columns `[athleteId,date]` on the table `Biometrics` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Biometrics_athleteId_date_key" ON "Biometrics"("athleteId", "date");
