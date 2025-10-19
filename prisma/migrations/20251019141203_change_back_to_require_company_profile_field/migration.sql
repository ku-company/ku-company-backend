/*
  Warnings:

  - Made the column `description` on table `companyProfile` required. This step will fail if there are existing NULL values in that column.
  - Made the column `industry` on table `companyProfile` required. This step will fail if there are existing NULL values in that column.
  - Made the column `location` on table `companyProfile` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tel` on table `companyProfile` required. This step will fail if there are existing NULL values in that column.
  - Made the column `country` on table `companyProfile` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."companyProfile" ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "industry" SET NOT NULL,
ALTER COLUMN "location" SET NOT NULL,
ALTER COLUMN "tel" SET NOT NULL,
ALTER COLUMN "country" SET NOT NULL;
