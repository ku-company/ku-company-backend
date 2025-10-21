-- AlterTable
ALTER TABLE "public"."aiVerification" ALTER COLUMN "verified_by" SET DATA TYPE TEXT,
ALTER COLUMN "trust_level" SET DATA TYPE TEXT,
ALTER COLUMN "reason" SET DATA TYPE TEXT,
ALTER COLUMN "evidence_url" SET DATA TYPE TEXT;
