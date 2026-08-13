/*
  Warnings:

  - You are about to drop the column `asignee_id` on the `tickets` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "tickets" DROP CONSTRAINT "tickets_asignee_id_fkey";

-- AlterTable
ALTER TABLE "tickets" DROP COLUMN "asignee_id",
ADD COLUMN     "assignee_id" TEXT;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_assignee_id_fkey" FOREIGN KEY ("assignee_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
