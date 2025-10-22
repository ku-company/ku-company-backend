-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."NotificationStatus" ADD VALUE 'Unread';
ALTER TYPE "public"."NotificationStatus" ADD VALUE 'Read';

-- AlterEnum
ALTER TYPE "public"."NotificationType" ADD VALUE 'NewAnnouncement';

-- AlterTable
ALTER TABLE "public"."Notification" ADD COLUMN     "professor_id" INTEGER,
ALTER COLUMN "company_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_professor_id_fkey" FOREIGN KEY ("professor_id") REFERENCES "public"."professorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
