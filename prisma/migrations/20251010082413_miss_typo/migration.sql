/*
  Warnings:

  - You are about to drop the column `applicaition_id` on the `Notification` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Notification" DROP CONSTRAINT "Notification_applicaition_id_fkey";

-- AlterTable
ALTER TABLE "public"."Notification" DROP COLUMN "applicaition_id",
ADD COLUMN     "application_id" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "public"."jobApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
