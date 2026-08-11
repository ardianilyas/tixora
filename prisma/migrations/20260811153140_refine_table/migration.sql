/*
  Warnings:

  - You are about to drop the column `user_id` on the `tickets` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[code]` on the table `tickets` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `tickets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `creator_id` to the `tickets` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TicketPriority" AS ENUM ('low', 'medium', 'high', 'critical');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('open', 'in_progress', 'resolved');

-- DropForeignKey
ALTER TABLE "tickets" DROP CONSTRAINT "tickets_user_id_fkey";

-- AlterTable
ALTER TABLE "tickets" DROP COLUMN "user_id",
ADD COLUMN     "asignee_id" TEXT,
ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "creator_id" TEXT NOT NULL,
ADD COLUMN     "priority" "TicketPriority" NOT NULL DEFAULT 'low',
ADD COLUMN     "resolved_at" TIMESTAMP(3),
ADD COLUMN     "status" "TicketStatus" NOT NULL DEFAULT 'open';

-- CreateIndex
CREATE UNIQUE INDEX "tickets_code_key" ON "tickets"("code");

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_asignee_id_fkey" FOREIGN KEY ("asignee_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
