-- CreateTable
CREATE TABLE "public"."AI_Verification" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "verified_by" VARCHAR(255),
    "trust_level" VARCHAR(50),
    "reason" VARCHAR(500),
    "evidence_url" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AI_Verification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AI_Verification_user_id_key" ON "public"."AI_Verification"("user_id");

-- AddForeignKey
ALTER TABLE "public"."AI_Verification" ADD CONSTRAINT "AI_Verification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
