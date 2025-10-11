/*
  Warnings:

  - You are about to drop the column `confirmed_at` on the `jobApplication` table. All the data in the column will be lost.
  - You are about to drop the column `responded_at` on the `jobApplication` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `jobApplication` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."CompanyJobApplicationStatus" AS ENUM ('Pending', 'Confirmed', 'Requested', 'Accepted', 'Rejected');

-- CreateEnum
CREATE TYPE "public"."EmployeeJobApplicationStatus" AS ENUM ('Confirmed', 'Rejected', 'Pending');

-- AlterTable
ALTER TABLE "public"."jobApplication" DROP COLUMN "confirmed_at",
DROP COLUMN "responded_at",
DROP COLUMN "status",
ADD COLUMN     "company_responded_at" TIMESTAMP(3),
ADD COLUMN     "company_send_status" "public"."CompanyJobApplicationStatus" NOT NULL DEFAULT 'Pending',
ADD COLUMN     "employee_responded_at" TIMESTAMP(3),
ADD COLUMN     "employee_send_status" "public"."EmployeeJobApplicationStatus" NOT NULL DEFAULT 'Pending';

-- DropEnum
DROP TYPE "public"."JobApplicationStatus";
