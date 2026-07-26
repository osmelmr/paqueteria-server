-- AlterTable
ALTER TABLE "packages" ADD COLUMN     "alert" BOOLEAN DEFAULT false,
ADD COLUMN     "alert_description" TEXT,
ADD COLUMN     "anotations" TEXT;
