/*
  Warnings:

  - The values [Accepted] on the enum `VerifiedStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."VerifiedStatus_new" AS ENUM ('Pending', 'Approved', 'Rejected');
ALTER TABLE "public"."User" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."User" ALTER COLUMN "status" TYPE "public"."VerifiedStatus_new" USING ("status"::text::"public"."VerifiedStatus_new");
ALTER TYPE "public"."VerifiedStatus" RENAME TO "VerifiedStatus_old";
ALTER TYPE "public"."VerifiedStatus_new" RENAME TO "VerifiedStatus";
DROP TYPE "public"."VerifiedStatus_old";
ALTER TABLE "public"."User" ALTER COLUMN "status" SET DEFAULT 'Pending';
COMMIT;
