-- AlterTable
ALTER TABLE "public"."professorProfile" ADD COLUMN     "lab" TEXT;

-- CreateTable
CREATE TABLE "public"."Degree" (
    "id" SERIAL NOT NULL,
    "professor_profile_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "institution" TEXT,
    "graduation_date" TIMESTAMP(3),
    "description" TEXT,

    CONSTRAINT "Degree_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Degree" ADD CONSTRAINT "Degree_professor_profile_id_fkey" FOREIGN KEY ("professor_profile_id") REFERENCES "public"."professorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
