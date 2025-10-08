/*
  Warnings:

  - You are about to alter the column `tel` on the `companyProfile` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(20)`.

*/
-- AlterTable
ALTER TABLE "public"."companyProfile" ALTER COLUMN "tel" SET DATA TYPE VARCHAR(20);
