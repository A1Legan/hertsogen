-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "playerName" TEXT NOT NULL,
    "playerCountry" TEXT NOT NULL DEFAULT 'Unknown',
    "levelName" TEXT NOT NULL,
    "progress" INTEGER NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "comment" TEXT,
    "contact" TEXT,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "ipHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Submission_status_createdAt_idx" ON "Submission"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Submission_ipHash_createdAt_idx" ON "Submission"("ipHash", "createdAt");
