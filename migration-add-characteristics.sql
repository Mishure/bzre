-- Add new property characteristics fields
-- Run this SQL in your Supabase SQL Editor or via psql

ALTER TABLE properties
ADD COLUMN IF NOT EXISTS heating VARCHAR(255),
ADD COLUMN IF NOT EXISTS condition VARCHAR(255),
ADD COLUMN IF NOT EXISTS "availableFrom" VARCHAR(255),
ADD COLUMN IF NOT EXISTS deposit VARCHAR(255),
ADD COLUMN IF NOT EXISTS "buildingType" VARCHAR(255),
ADD COLUMN IF NOT EXISTS "buildingMaterial" VARCHAR(255),
ADD COLUMN IF NOT EXISTS "yearBuilt" INTEGER;

-- Add comments for documentation
COMMENT ON COLUMN properties.heating IS 'Încălzire (Heating system)';
COMMENT ON COLUMN properties.condition IS 'Stare (Property condition)';
COMMENT ON COLUMN properties."availableFrom" IS 'Liber de la (Available from date)';
COMMENT ON COLUMN properties.deposit IS 'Garanție (Deposit amount)';
COMMENT ON COLUMN properties."buildingType" IS 'Tip clădire (Building type)';
COMMENT ON COLUMN properties."buildingMaterial" IS 'Material construcție (Building material)';
COMMENT ON COLUMN properties."yearBuilt" IS 'An construcție (Year built)';
