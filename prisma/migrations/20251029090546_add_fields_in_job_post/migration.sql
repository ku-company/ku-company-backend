/*
  Warnings:

  - Added the required column `location` to the `jobPost` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maximum_expected_salary` to the `jobPost` table without a default value. This is not possible if the table is not empty.
  - Added the required column `minimum_expected_salary` to the `jobPost` table without a default value. This is not possible if the table is not empty.
  - Added the required column `work_place` to the `jobPost` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."WorkPlace" AS ENUM ('Online', 'Onsite', 'Hybrid');

-- AlterTable
ALTER TABLE "public"."jobPost" ADD COLUMN     "location" TEXT NOT NULL,
ADD COLUMN     "maximum_expected_salary" INTEGER NOT NULL,
ADD COLUMN     "minimum_expected_salary" INTEGER NOT NULL,
ADD COLUMN     "work_place" "public"."WorkPlace" NOT NULL;
