-- Add images column to property_submissions table
-- Run this in your Supabase SQL Editor

ALTER TABLE property_submissions
ADD COLUMN IF NOT EXISTS images TEXT;

SELECT 'Images column added successfully!' AS status;
