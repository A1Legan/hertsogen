/*
  Warnings:

  - A unique constraint covering the columns `[updateToken]` on the table `Stream` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Stream" ADD COLUMN     "lastCheckedAt" TIMESTAMP(3),
ADD COLUMN     "streamTitle" TEXT,
ADD COLUMN     "twitchLogin" TEXT,
ADD COLUMN     "updateToken" TEXT NOT NULL DEFAULT gen_random_uuid(),
ADD COLUMN     "youtubeVideoId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Stream_updateToken_key" ON "Stream"("updateToken");
