-- CreateEnum
CREATE TYPE "public"."VerifiedStatus" AS ENUM ('Pending', 'Accepted', 'Rejected');

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "status" "public"."VerifiedStatus" NOT NULL DEFAULT 'Pending';
