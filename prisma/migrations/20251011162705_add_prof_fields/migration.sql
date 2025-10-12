/*
  Warnings:

  - Added the required column `updated_at` to the `professorProfile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."professorProfile" ADD COLUMN     "contactInfo" VARCHAR(255),
ADD COLUMN     "position" VARCHAR(255),
ADD COLUMN     "summary" VARCHAR(255),
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;
