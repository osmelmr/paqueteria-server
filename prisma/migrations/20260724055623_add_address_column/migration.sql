/*
  Warnings:

  - You are about to drop the column `type` on the `locations` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `package_hbls` table. All the data in the column will be lost.
  - You are about to drop the column `address_detail` on the `packages` table. All the data in the column will be lost.
  - You are about to drop the column `content_description` on the `packages` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `recipients` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `recipients` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `statuses` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "locations" DROP COLUMN "type";

-- AlterTable
ALTER TABLE "package_hbls" DROP COLUMN "created_at";

-- AlterTable
ALTER TABLE "packages" DROP COLUMN "address_detail",
DROP COLUMN "content_description",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "content" TEXT;

-- AlterTable
ALTER TABLE "recipients" DROP COLUMN "address",
DROP COLUMN "created_at";

-- AlterTable
ALTER TABLE "statuses" DROP COLUMN "category";

-- CreateTable
CREATE TABLE "package_status_history" (
    "id" UUID NOT NULL,
    "package_id" UUID NOT NULL,
    "status_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "package_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "package_status_history_package_id_idx" ON "package_status_history"("package_id");

-- CreateIndex
CREATE INDEX "package_status_history_status_id_idx" ON "package_status_history"("status_id");

-- AddForeignKey
ALTER TABLE "package_status_history" ADD CONSTRAINT "package_status_history_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_status_history" ADD CONSTRAINT "package_status_history_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
