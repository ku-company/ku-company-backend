/*
  Warnings:

  - A unique constraint covering the columns `[job_post_id]` on the table `aiVerification` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."aiVerification" ADD COLUMN     "job_post_id" INTEGER,
ALTER COLUMN "user_id" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "aiVerification_job_post_id_key" ON "public"."aiVerification"("job_post_id");

-- AddForeignKey
ALTER TABLE "public"."aiVerification" ADD CONSTRAINT "aiVerification_job_post_id_fkey" FOREIGN KEY ("job_post_id") REFERENCES "public"."jobPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
