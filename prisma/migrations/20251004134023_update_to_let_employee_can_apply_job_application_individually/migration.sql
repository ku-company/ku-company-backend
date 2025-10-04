-- DropForeignKey
ALTER TABLE "public"."jobApplication" DROP CONSTRAINT "jobApplication_batch_id_fkey";

-- AlterTable
ALTER TABLE "public"."jobApplication" ADD COLUMN     "employee_id" INTEGER,
ALTER COLUMN "batch_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."jobApplication" ADD CONSTRAINT "jobApplication_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "public"."jobApplicationBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."jobApplication" ADD CONSTRAINT "jobApplication_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."employeeProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
