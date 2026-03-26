/*
  Warnings:

  - You are about to drop the column `semester` on the `Discipline` table. All the data in the column will be lost.
  - You are about to drop the column `semester` on the `Enrollment` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[studentId,disciplineId,period]` on the table `Enrollment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `period` to the `Discipline` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workload` to the `Discipline` table without a default value. This is not possible if the table is not empty.
  - Added the required column `period` to the `Enrollment` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Enrollment_studentId_disciplineId_semester_key";

-- AlterTable
ALTER TABLE "Discipline" DROP COLUMN "semester",
ADD COLUMN     "period" INTEGER NOT NULL,
ADD COLUMN     "workload" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Enrollment" DROP COLUMN "semester",
ADD COLUMN     "period" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_studentId_disciplineId_period_key" ON "Enrollment"("studentId", "disciplineId", "period");
