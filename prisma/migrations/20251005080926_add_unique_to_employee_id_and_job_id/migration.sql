/*
  Warnings:

  - A unique constraint covering the columns `[employee_id,job_id]` on the table `jobApplication` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "jobApplication_employee_id_job_id_key" ON "public"."jobApplication"("employee_id", "job_id");
