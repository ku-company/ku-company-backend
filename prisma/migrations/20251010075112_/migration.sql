/*
  Warnings:

  - The `status` column on the `jobApplication` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."jobApplication" DROP COLUMN "status",
ADD COLUMN     "status" "public"."JobApplicationStatus" NOT NULL DEFAULT 'Pending';
