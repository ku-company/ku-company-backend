/*
  Warnings:

  - You are about to drop the column `available_postion` on the `jobPost` table. All the data in the column will be lost.
  - Added the required column `available_position` to the `jobPost` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."jobPost" DROP COLUMN "available_postion",
ADD COLUMN     "available_position" INTEGER NOT NULL;
