/*
  Warnings:

  - The values [SPIRITUAL_PARTNERSHIP] on the enum `MaritalGoals` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `aboutMe` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `middleInitial` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `moralIntegrityConfirmed` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `Member` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "MaritalGoals_new" AS ENUM ('MARRIAGE_ONLY', 'SPIRITUAL_GROWTH', 'FAMILY_FOCUSED');
ALTER TABLE "Member" ALTER COLUMN "maritalGoals" DROP DEFAULT;
ALTER TABLE "Member" ALTER COLUMN "maritalGoals" TYPE "MaritalGoals_new" USING ("maritalGoals"::text::"MaritalGoals_new");
ALTER TYPE "MaritalGoals" RENAME TO "MaritalGoals_old";
ALTER TYPE "MaritalGoals_new" RENAME TO "MaritalGoals";
DROP TYPE "MaritalGoals_old";
COMMIT;

-- AlterTable
ALTER TABLE "Member" DROP COLUMN "aboutMe",
DROP COLUMN "middleInitial",
DROP COLUMN "moralIntegrityConfirmed",
DROP COLUMN "state",
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "moralIntegrity" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "baptismStatus" DROP NOT NULL,
ALTER COLUMN "baptismStatus" DROP DEFAULT,
ALTER COLUMN "childrenPreference" DROP NOT NULL,
ALTER COLUMN "childrenPreference" DROP DEFAULT,
ALTER COLUMN "fieldService" DROP NOT NULL,
ALTER COLUMN "fieldService" DROP DEFAULT,
ALTER COLUMN "maritalGoals" DROP NOT NULL,
ALTER COLUMN "maritalGoals" DROP DEFAULT,
ALTER COLUMN "meetingAttendance" DROP NOT NULL,
ALTER COLUMN "meetingAttendance" DROP DEFAULT;
