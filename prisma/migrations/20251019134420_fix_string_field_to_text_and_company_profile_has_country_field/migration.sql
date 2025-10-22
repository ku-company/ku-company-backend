/*
  Warnings:

  - You are about to drop the `Link` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `country` to the `companyProfile` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Link" DROP CONSTRAINT "Link_user_id_fkey";

-- AlterTable
ALTER TABLE "public"."Announcement" ALTER COLUMN "content" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "public"."Comment" ALTER COLUMN "content" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "public"."Notification" ALTER COLUMN "message" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "public"."companyProfile" ADD COLUMN     "country" TEXT NOT NULL,
ADD COLUMN     "link" TEXT,
ALTER COLUMN "company_name" SET DATA TYPE TEXT,
ALTER COLUMN "description" SET DATA TYPE TEXT,
ALTER COLUMN "industry" SET DATA TYPE TEXT,
ALTER COLUMN "location" SET DATA TYPE TEXT,
ALTER COLUMN "tel" SET DATA TYPE VARCHAR(30);

-- AlterTable
ALTER TABLE "public"."employeeProfile" ADD COLUMN     "link" TEXT,
ALTER COLUMN "education" SET DATA TYPE TEXT,
ALTER COLUMN "summary" SET DATA TYPE TEXT,
ALTER COLUMN "skills" SET DATA TYPE TEXT,
ALTER COLUMN "experience" SET DATA TYPE TEXT,
ALTER COLUMN "contactInfo" SET DATA TYPE TEXT,
ALTER COLUMN "languages" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "public"."jobPost" ALTER COLUMN "description" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "public"."professorProfile" ADD COLUMN     "link" TEXT,
ALTER COLUMN "department" SET DATA TYPE TEXT,
ALTER COLUMN "faculty" SET DATA TYPE TEXT,
ALTER COLUMN "contactInfo" SET DATA TYPE TEXT,
ALTER COLUMN "position" SET DATA TYPE TEXT,
ALTER COLUMN "summary" SET DATA TYPE TEXT;

-- DropTable
DROP TABLE "public"."Link";
