/*
  Warnings:

  - Added the required column `job_title` to the `jobPost` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."jobPost" ADD COLUMN     "job_title" TEXT NOT NULL;
