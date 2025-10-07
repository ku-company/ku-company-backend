-- AlterTable
ALTER TABLE "public"."jobApplication" ADD COLUMN     "resume_id" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."jobApplication" ADD CONSTRAINT "jobApplication_resume_id_fkey" FOREIGN KEY ("resume_id") REFERENCES "public"."Resume"("id") ON DELETE SET NULL ON UPDATE CASCADE;
