-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('Student', 'Alumni', 'Admin', 'Company');

-- CreateEnum
CREATE TYPE "public"."JobStatus" AS ENUM ('Pending', 'Accepted', 'Rejected');

-- CreateEnum
CREATE TYPE "public"."JobType" AS ENUM ('FullTime', 'PartTime', 'Internship', 'Contract');

-- CreateEnum
CREATE TYPE "public"."Position" AS ENUM ('Backend_Developer', 'Frontend_Developer', 'Fullstack_Developer');

-- CreateEnum
CREATE TYPE "public"."NotificationStatus" AS ENUM ('Pending', 'Accepted', 'Rejected');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "first_name" VARCHAR(255) NOT NULL,
    "last_name" VARCHAR(255) NOT NULL,
    "user_name" VARCHAR(255),
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255),
    "roles" "public"."Role" NOT NULL DEFAULT 'Student',
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "profile_image" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."professorProfile" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "department" VARCHAR(255) NOT NULL,
    "faculty" VARCHAR(255) NOT NULL,

    CONSTRAINT "professorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."employeeProfile" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "education" VARCHAR(255) NOT NULL,
    "summary" VARCHAR(255) NOT NULL,
    "skills" VARCHAR(255) NOT NULL,
    "experience" VARCHAR(255) NOT NULL,
    "contactInfo" VARCHAR(255) NOT NULL,
    "languages" VARCHAR(255) NOT NULL,

    CONSTRAINT "employeeProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Link" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "link_name" VARCHAR(255) NOT NULL,
    "url" VARCHAR(255) NOT NULL,

    CONSTRAINT "Link_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Resume" (
    "id" SERIAL NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "file_url" VARCHAR(255) NOT NULL,
    "is_main" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Resume_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."companyProfile" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "company_name" VARCHAR(255) NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "industry" VARCHAR(255) NOT NULL,

    CONSTRAINT "companyProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."jobApplicationBatch" (
    "id" SERIAL NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "resume_id" INTEGER NOT NULL,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "jobApplicationBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."jobApplication" (
    "id" SERIAL NOT NULL,
    "batch_id" INTEGER NOT NULL,
    "job_id" INTEGER NOT NULL,
    "status" VARCHAR(255) NOT NULL DEFAULT 'pending',
    "applied_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "jobApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."jobPost" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "jobType" "public"."JobType" NOT NULL,
    "position" "public"."Position" NOT NULL,
    "available_postion" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jobPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Announcement" (
    "id" SERIAL NOT NULL,
    "professor_id" INTEGER NOT NULL,
    "job_id" INTEGER,
    "content" VARCHAR(255) NOT NULL,
    "is_connection" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Notification" (
    "id" SERIAL NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "company_id" INTEGER NOT NULL,
    "applicaition_id" INTEGER,
    "message" VARCHAR(255),
    "notification_status" "public"."NotificationStatus" NOT NULL DEFAULT 'Pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_user_name_key" ON "public"."User"("user_name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "professorProfile_user_id_key" ON "public"."professorProfile"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "employeeProfile_user_id_key" ON "public"."employeeProfile"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "companyProfile_user_id_key" ON "public"."companyProfile"("user_id");

-- AddForeignKey
ALTER TABLE "public"."professorProfile" ADD CONSTRAINT "professorProfile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."employeeProfile" ADD CONSTRAINT "employeeProfile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Link" ADD CONSTRAINT "Link_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Resume" ADD CONSTRAINT "Resume_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."employeeProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."jobApplicationBatch" ADD CONSTRAINT "jobApplicationBatch_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."employeeProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."jobApplicationBatch" ADD CONSTRAINT "jobApplicationBatch_resume_id_fkey" FOREIGN KEY ("resume_id") REFERENCES "public"."Resume"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."jobApplication" ADD CONSTRAINT "jobApplication_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "public"."jobApplicationBatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."jobApplication" ADD CONSTRAINT "jobApplication_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."jobPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."jobPost" ADD CONSTRAINT "jobPost_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companyProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Announcement" ADD CONSTRAINT "Announcement_professor_id_fkey" FOREIGN KEY ("professor_id") REFERENCES "public"."professorProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Announcement" ADD CONSTRAINT "Announcement_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."jobPost"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."employeeProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companyProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_applicaition_id_fkey" FOREIGN KEY ("applicaition_id") REFERENCES "public"."jobApplication"("id") ON DELETE SET NULL ON UPDATE CASCADE;
