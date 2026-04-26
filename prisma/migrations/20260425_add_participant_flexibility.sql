-- Migration: Add flexible participant registration support
-- Date: 2026-04-25
-- Description: Adds audience type fields to Class model and optional Guardian model for child enrollments

-- Add Guardian table for optional parent/guardian relationships
CREATE TABLE IF NOT EXISTS "Guardian" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "fullName" TEXT NOT NULL,
  "email" TEXT,
  "phone" TEXT,
  "relationship" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Add guardianId to StudentProfile (optional relationship)
ALTER TABLE "StudentProfile" ADD COLUMN IF NOT EXISTS "guardianId" TEXT;

-- Add audience and requirement fields to Class model
ALTER TABLE "Class" ADD COLUMN IF NOT EXISTS "audienceType" TEXT NOT NULL DEFAULT 'mixed';
ALTER TABLE "Class" ADD COLUMN IF NOT EXISTS "requiresGuardian" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Class" ADD COLUMN IF NOT EXISTS "genderRestriction" TEXT;
ALTER TABLE "Class" ADD COLUMN IF NOT EXISTS "ageMin" INTEGER;
ALTER TABLE "Class" ADD COLUMN IF NOT EXISTS "ageMax" INTEGER;
ALTER TABLE "Class" ADD COLUMN IF NOT EXISTS "capacity" INTEGER;

-- Create indexes
CREATE INDEX IF NOT EXISTS "Guardian_email_idx" ON "Guardian"("email");
CREATE INDEX IF NOT EXISTS "StudentProfile_guardianId_idx" ON "StudentProfile"("guardianId");
CREATE INDEX IF NOT EXISTS "Class_audienceType_idx" ON "Class"("audienceType");

-- Add foreign key constraint
ALTER TABLE "StudentProfile" 
  ADD CONSTRAINT "StudentProfile_guardianId_fkey" 
  FOREIGN KEY ("guardianId") 
  REFERENCES "Guardian"("id") 
  ON DELETE SET NULL 
  ON UPDATE CASCADE;

-- Comments for documentation
COMMENT ON COLUMN "Class"."audienceType" IS 'Target audience: children, teens, adults, family, or mixed';
COMMENT ON COLUMN "Class"."requiresGuardian" IS 'Whether enrollment requires a guardian/parent contact';
COMMENT ON COLUMN "Class"."genderRestriction" IS 'Optional gender restriction: male, female, or null for mixed';
COMMENT ON COLUMN "Class"."ageMin" IS 'Optional minimum age requirement in years';
COMMENT ON COLUMN "Class"."ageMax" IS 'Optional maximum age requirement in years';
COMMENT ON COLUMN "Class"."capacity" IS 'Optional maximum enrollment capacity';
