/*
  Warnings:

  - The values [Onsite] on the enum `WorkPlace` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."WorkPlace_new" AS ENUM ('Online', 'OnSite', 'Hybrid');
ALTER TABLE "public"."jobPost" ALTER COLUMN "work_place" TYPE "public"."WorkPlace_new" USING ("work_place"::text::"public"."WorkPlace_new");
ALTER TYPE "public"."WorkPlace" RENAME TO "WorkPlace_old";
ALTER TYPE "public"."WorkPlace_new" RENAME TO "WorkPlace";
DROP TYPE "public"."WorkPlace_old";
COMMIT;
