-- CreateEnum
CREATE TYPE "SubmissionKind" AS ENUM ('RECORD', 'STREAMER');

-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "kind" "SubmissionKind" NOT NULL DEFAULT 'RECORD',
ADD COLUMN     "twitchLogin" TEXT,
ADD COLUMN     "youtubeChannelId" TEXT,
ALTER COLUMN "videoUrl" DROP NOT NULL;
