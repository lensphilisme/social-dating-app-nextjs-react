/*
  Warnings:

  - Changed the type of `gender` on the `Member` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "BaptismStatus" AS ENUM ('BAPTIZED', 'INACTIVE', 'NEEDS_ENCOURAGEMENT');

-- CreateEnum
CREATE TYPE "MeetingAttendance" AS ENUM ('REGULAR', 'OCCASIONAL', 'RARELY');

-- CreateEnum
CREATE TYPE "FieldService" AS ENUM ('ACTIVE', 'OCCASIONAL', 'INACTIVE');

-- CreateEnum
CREATE TYPE "MaritalGoals" AS ENUM ('MARRIAGE_ONLY', 'SPIRITUAL_PARTNERSHIP');

-- CreateEnum
CREATE TYPE "ChildrenPreference" AS ENUM ('WANT_CHILDREN', 'MAYBE', 'PREFER_NONE');

-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "aboutMe" TEXT,
ADD COLUMN     "baptismStatus" "BaptismStatus" NOT NULL DEFAULT 'BAPTIZED',
ADD COLUMN     "childrenPreference" "ChildrenPreference" NOT NULL DEFAULT 'WANT_CHILDREN',
ADD COLUMN     "congregation" TEXT,
ADD COLUMN     "education" TEXT,
ADD COLUMN     "favoriteScripture" TEXT,
ADD COLUMN     "fieldService" "FieldService" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "hobbies" TEXT,
ADD COLUMN     "languages" TEXT,
ADD COLUMN     "maritalGoals" "MaritalGoals" NOT NULL DEFAULT 'MARRIAGE_ONLY',
ADD COLUMN     "meetingAttendance" "MeetingAttendance" NOT NULL DEFAULT 'REGULAR',
ADD COLUMN     "middleInitial" TEXT,
ADD COLUMN     "moralIntegrityConfirmed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "profession" TEXT,
ADD COLUMN     "spiritualAchievements" TEXT,
ADD COLUMN     "spiritualExpectations" TEXT,
ADD COLUMN     "spiritualGoals" TEXT,
ADD COLUMN     "spiritualStatement" TEXT,
ADD COLUMN     "state" TEXT,
DROP COLUMN "gender",
ADD COLUMN     "gender" "Gender" NOT NULL;
