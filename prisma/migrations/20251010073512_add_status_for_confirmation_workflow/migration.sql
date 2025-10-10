-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('ApplicationSubmitted', 'ApplicationConfirmed', 'ConfirmationAccepted', 'ConfirmationRejected');

-- CreateEnum
CREATE TYPE "public"."JobApplicationStatus" AS ENUM ('Pending', 'Confirmed', 'Requested', 'Accepted', 'Rejected');

-- AlterEnum
ALTER TYPE "public"."NotificationStatus" ADD VALUE 'Requested';

-- AlterTable
ALTER TABLE "public"."Notification" ADD COLUMN     "notification_type" "public"."NotificationType" NOT NULL DEFAULT 'ApplicationSubmitted';

-- AlterTable
ALTER TABLE "public"."employeeProfile" ADD COLUMN     "has_job" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."jobApplication" ADD COLUMN     "confirmed_at" TIMESTAMP(3),
ADD COLUMN     "responded_at" TIMESTAMP(3);
