/*
  Warnings:

  - Added the required column `location` to the `companyProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tel` to the `companyProfile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."companyProfile" ADD COLUMN     "location" VARCHAR(255) NOT NULL,
ADD COLUMN     "tel" VARCHAR(255) NOT NULL;
