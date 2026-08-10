-- CreateTable
CREATE TABLE "News" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'Новость',
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "text" TEXT NOT NULL,
    "image" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "News_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stream" (
    "id" TEXT NOT NULL,
    "playerName" TEXT NOT NULL,
    "playerCountry" TEXT NOT NULL DEFAULT 'Unknown',
    "levelName" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "isLive" BOOLEAN NOT NULL DEFAULT false,
    "url" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stream_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityRank" (
    "levelId" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "requirement" INTEGER NOT NULL DEFAULT 100,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunityRank_pkey" PRIMARY KEY ("levelId")
);

-- CreateIndex
CREATE INDEX "News_published_date_idx" ON "News"("published", "date");

-- CreateIndex
CREATE INDEX "Stream_isLive_sortOrder_idx" ON "Stream"("isLive", "sortOrder");

-- CreateIndex
CREATE INDEX "CommunityRank_position_idx" ON "CommunityRank"("position");
