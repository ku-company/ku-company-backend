/*
  Warnings:

  - You are about to drop the `AI_Verification` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."AI_Verification" DROP CONSTRAINT "AI_Verification_user_id_fkey";

-- DropTable
DROP TABLE "public"."AI_Verification";

-- CreateTable
CREATE TABLE "public"."aiVerification" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "verified_by" VARCHAR(255),
    "trust_level" VARCHAR(50),
    "reason" VARCHAR(500),
    "evidence_url" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aiVerification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "aiVerification_user_id_key" ON "public"."aiVerification"("user_id");

-- AddForeignKey
ALTER TABLE "public"."aiVerification" ADD CONSTRAINT "aiVerification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
