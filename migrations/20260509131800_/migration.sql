/*
  Warnings:

  - A unique constraint covering the columns `[name,coachId]` on the table `Exercise` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Exercise_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "Exercise_name_coachId_key" ON "Exercise"("name", "coachId");
