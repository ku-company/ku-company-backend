-- DropForeignKey
ALTER TABLE "public"."Announcement" DROP CONSTRAINT "Announcement_professor_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Notification" DROP CONSTRAINT "Notification_applicaition_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Notification" DROP CONSTRAINT "Notification_company_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Notification" DROP CONSTRAINT "Notification_employee_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Resume" DROP CONSTRAINT "Resume_employee_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."companyProfile" DROP CONSTRAINT "companyProfile_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."employeeProfile" DROP CONSTRAINT "employeeProfile_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."jobApplication" DROP CONSTRAINT "jobApplication_job_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."jobApplicationBatch" DROP CONSTRAINT "jobApplicationBatch_employee_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."jobApplicationBatch" DROP CONSTRAINT "jobApplicationBatch_resume_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."jobPost" DROP CONSTRAINT "jobPost_company_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."professorProfile" DROP CONSTRAINT "professorProfile_user_id_fkey";

-- AddForeignKey
ALTER TABLE "public"."professorProfile" ADD CONSTRAINT "professorProfile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."employeeProfile" ADD CONSTRAINT "employeeProfile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Resume" ADD CONSTRAINT "Resume_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."employeeProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."companyProfile" ADD CONSTRAINT "companyProfile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."jobApplicationBatch" ADD CONSTRAINT "jobApplicationBatch_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."employeeProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."jobApplicationBatch" ADD CONSTRAINT "jobApplicationBatch_resume_id_fkey" FOREIGN KEY ("resume_id") REFERENCES "public"."Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."jobApplication" ADD CONSTRAINT "jobApplication_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."jobPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."jobPost" ADD CONSTRAINT "jobPost_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companyProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Announcement" ADD CONSTRAINT "Announcement_professor_id_fkey" FOREIGN KEY ("professor_id") REFERENCES "public"."professorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."employeeProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companyProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_applicaition_id_fkey" FOREIGN KEY ("applicaition_id") REFERENCES "public"."jobApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
