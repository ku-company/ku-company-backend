-- CreateEnum
CREATE TYPE "public"."AnnouncementType" AS ENUM ('Announcement', 'Repost', 'Opinion');

-- AlterTable
ALTER TABLE "public"."Announcement" ADD COLUMN     "type_post" "public"."AnnouncementType" NOT NULL DEFAULT 'Opinion';
