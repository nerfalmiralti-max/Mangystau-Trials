-- Deduplicate legacy records before enforcing account ownership uniqueness.
DELETE FROM "SavedLocation" AS older
USING "SavedLocation" AS newer
WHERE older."touristId" = newer."touristId"
  AND older."locationId" = newer."locationId"
  AND older."id" > newer."id";

CREATE UNIQUE INDEX "SavedLocation_touristId_locationId_key"
ON "SavedLocation"("touristId", "locationId");

CREATE INDEX "SavedLocation_touristId_savedAt_idx"
ON "SavedLocation"("touristId", "savedAt");

CREATE TABLE "SavedRoute" (
    "id" TEXT NOT NULL,
    "touristId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SavedRoute_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SavedRoute_touristId_planId_key"
ON "SavedRoute"("touristId", "planId");

CREATE INDEX "SavedRoute_touristId_updatedAt_idx"
ON "SavedRoute"("touristId", "updatedAt");

ALTER TABLE "SavedRoute"
ADD CONSTRAINT "SavedRoute_touristId_fkey"
FOREIGN KEY ("touristId") REFERENCES "Tourist"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "touristId" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Review"
ADD CONSTRAINT "Review_rating_check" CHECK ("rating" BETWEEN 1 AND 5);

CREATE UNIQUE INDEX "Review_touristId_placeId_key"
ON "Review"("touristId", "placeId");

CREATE INDEX "Review_placeId_createdAt_idx"
ON "Review"("placeId", "createdAt");

ALTER TABLE "Review"
ADD CONSTRAINT "Review_touristId_fkey"
FOREIGN KEY ("touristId") REFERENCES "Tourist"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Review"
ADD CONSTRAINT "Review_placeId_fkey"
FOREIGN KEY ("placeId") REFERENCES "Place"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
