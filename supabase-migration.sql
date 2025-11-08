-- Supabase Migration Script
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/lrywxojospwerllzjifz/sql

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'AGENT',
    active BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    price DOUBLE PRECISION NOT NULL,
    zone TEXT NOT NULL,
    comfort TEXT,
    street TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    surface DOUBLE PRECISION NOT NULL,
    "registrationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ownerCnp" TEXT,
    rooms INTEGER NOT NULL,
    floor INTEGER,
    "totalFloors" INTEGER,
    position TEXT,
    locality TEXT NOT NULL,
    "operationType" TEXT NOT NULL,
    "propertyType" TEXT NOT NULL,
    description TEXT,
    features TEXT,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    featured BOOLEAN NOT NULL DEFAULT false,
    views INTEGER NOT NULL DEFAULT 0,
    "adminId" INTEGER NOT NULL REFERENCES admins(id),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivedAt" TIMESTAMP(3)
);

-- Create property_images table
CREATE TABLE IF NOT EXISTS property_images (
    id SERIAL PRIMARY KEY,
    url TEXT NOT NULL,
    alt TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "propertyId" INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create agents table
CREATE TABLE IF NOT EXISTS agents (
    id SERIAL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    email TEXT UNIQUE,
    zone TEXT NOT NULL,
    avatar TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create client_inquiries table
CREATE TABLE IF NOT EXISTS client_inquiries (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    "transactionType" TEXT NOT NULL,
    "propertyType" TEXT,
    price DOUBLE PRECISION,
    locality TEXT,
    zone TEXT,
    address TEXT,
    rooms INTEGER,
    surface DOUBLE PRECISION,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'NEW',
    "propertyId" INTEGER REFERENCES properties(id),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create exchange_rates table
CREATE TABLE IF NOT EXISTS exchange_rates (
    id SERIAL PRIMARY KEY,
    date TIMESTAMP(3) NOT NULL UNIQUE,
    "eurRate" DOUBLE PRECISION NOT NULL,
    "usdRate" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create admin_activities table
CREATE TABLE IF NOT EXISTS admin_activities (
    id SERIAL PRIMARY KEY,
    "adminId" INTEGER NOT NULL REFERENCES admins(id),
    action TEXT NOT NULL,
    resource TEXT NOT NULL,
    "resourceId" INTEGER,
    description TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_properties_adminId ON properties("adminId");
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_operationType ON properties("operationType");
CREATE INDEX IF NOT EXISTS idx_properties_propertyType ON properties("propertyType");
CREATE INDEX IF NOT EXISTS idx_property_images_propertyId ON property_images("propertyId");
CREATE INDEX IF NOT EXISTS idx_client_inquiries_propertyId ON client_inquiries("propertyId");
CREATE INDEX IF NOT EXISTS idx_client_inquiries_status ON client_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_admin_activities_adminId ON admin_activities("adminId");

-- Create function to update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updatedAt
CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_client_inquiries_updated_at BEFORE UPDATE ON client_inquiries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Success message
SELECT 'Migration completed successfully!' AS status;
