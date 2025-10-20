/*
  Warnings:

  - A unique constraint covering the columns `[stdId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "stdId" VARCHAR(255);

-- CreateIndex
CREATE UNIQUE INDEX "User_stdId_key" ON "public"."User"("stdId");
