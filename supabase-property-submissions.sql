-- Add PropertySubmission table to Supabase
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS property_submissions (
    id SERIAL PRIMARY KEY,

    -- Owner contact info
    "ownerName" TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,

    -- Property details
    "propertyType" TEXT NOT NULL,
    "operationType" TEXT NOT NULL,

    -- Location
    locality TEXT NOT NULL,
    zone TEXT NOT NULL,
    address TEXT NOT NULL,

    -- Specifications
    surface DOUBLE PRECISION NOT NULL,
    rooms INTEGER,
    floor INTEGER,
    "totalFloors" INTEGER,

    -- Pricing
    "estimatedPrice" DOUBLE PRECISION NOT NULL,

    -- Additional info
    description TEXT NOT NULL,
    features TEXT,
    images TEXT,

    -- Status tracking
    status TEXT NOT NULL DEFAULT 'NEW',

    -- Admin handling
    "assignedToId" INTEGER REFERENCES admins(id),
    notes TEXT,

    -- Timestamps
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contactedAt" TIMESTAMP(3)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_property_submissions_status ON property_submissions(status);
CREATE INDEX IF NOT EXISTS idx_property_submissions_assignedToId ON property_submissions("assignedToId");
CREATE INDEX IF NOT EXISTS idx_property_submissions_createdAt ON property_submissions("createdAt");

-- Create trigger for updatedAt
CREATE TRIGGER update_property_submissions_updated_at
BEFORE UPDATE ON property_submissions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

SELECT 'Property submissions table created successfully!' AS status;
