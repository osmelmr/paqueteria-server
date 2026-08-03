-- DropIndex
-- The agency type field is removed: the type (aerea/maritima) belongs to the guide.

-- AlterTable: drop the column "type" from "agencies"
ALTER TABLE "agencies" DROP COLUMN "type";

-- AlterTable: add the column "type" to "guides" (nullable first)
ALTER TABLE "guides" ADD COLUMN "type" "GuideType";

-- Backfill: existing guides default to AEREA
UPDATE "guides" SET "type" = 'AEREA' WHERE "type" IS NULL;

-- AlterTable: make it required
ALTER TABLE "guides" ALTER COLUMN "type" SET NOT NULL;
