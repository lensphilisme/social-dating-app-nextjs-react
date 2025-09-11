/*
  Warnings:

  - You are about to drop the column `currentLocation` on the `Member` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Member" DROP COLUMN "currentLocation",
ADD COLUMN     "baptismDate" TIMESTAMP(3);
