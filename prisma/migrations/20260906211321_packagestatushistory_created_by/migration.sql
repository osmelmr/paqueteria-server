-- AlterTable
ALTER TABLE "package_status_history" ADD COLUMN     "realy_created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "user_id" UUID;

-- AddForeignKey
ALTER TABLE "package_status_history" ADD CONSTRAINT "package_status_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
