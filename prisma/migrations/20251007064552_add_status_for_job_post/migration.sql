-- CreateEnum
CREATE TYPE "public"."JobPostStatus" AS ENUM ('Active', 'Expired', 'Closed');

-- AlterTable
ALTER TABLE "public"."jobPost" ADD COLUMN     "status" "public"."JobPostStatus" NOT NULL DEFAULT 'Active';
