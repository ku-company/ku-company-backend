/*
  Warnings:

  - The values [Accepted] on the enum `CompanyJobApplicationStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."CompanyJobApplicationStatus_new" AS ENUM ('Pending', 'Confirmed', 'Requested', 'Approved', 'Rejected');
ALTER TABLE "public"."jobApplication" ALTER COLUMN "company_send_status" DROP DEFAULT;
ALTER TABLE "public"."jobApplication" ALTER COLUMN "company_send_status" TYPE "public"."CompanyJobApplicationStatus_new" USING ("company_send_status"::text::"public"."CompanyJobApplicationStatus_new");
ALTER TYPE "public"."CompanyJobApplicationStatus" RENAME TO "CompanyJobApplicationStatus_old";
ALTER TYPE "public"."CompanyJobApplicationStatus_new" RENAME TO "CompanyJobApplicationStatus";
DROP TYPE "public"."CompanyJobApplicationStatus_old";
ALTER TABLE "public"."jobApplication" ALTER COLUMN "company_send_status" SET DEFAULT 'Pending';
COMMIT;
