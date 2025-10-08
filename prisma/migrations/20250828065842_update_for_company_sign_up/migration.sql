-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "company_name" VARCHAR(255),
ALTER COLUMN "first_name" DROP NOT NULL,
ALTER COLUMN "last_name" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."companyProfile" ADD CONSTRAINT "companyProfile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
