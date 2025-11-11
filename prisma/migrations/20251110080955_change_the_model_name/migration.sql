/*
  Warnings:

  - You are about to drop the `UserConsent` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."UserConsent" DROP CONSTRAINT "UserConsent_user_id_fkey";

-- DropTable
DROP TABLE "public"."UserConsent";

-- CreateTable
CREATE TABLE "public"."userConsent" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "consented" BOOLEAN NOT NULL DEFAULT false,
    "consented_at" TIMESTAMP(3),

    CONSTRAINT "userConsent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "userConsent_user_id_key" ON "public"."userConsent"("user_id");

-- AddForeignKey
ALTER TABLE "public"."userConsent" ADD CONSTRAINT "userConsent_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
