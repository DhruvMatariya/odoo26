-- Drivers table: scoped to organisation via access_code
-- Run this on an existing database.

CREATE TABLE IF NOT EXISTS drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  license_number TEXT NOT NULL,
  license_expiry DATE,
  organisation_access_code CHAR(6) NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_drivers_org_license ON drivers(organisation_access_code, license_number);
CREATE INDEX IF NOT EXISTS idx_drivers_org ON drivers(organisation_access_code);
CREATE INDEX IF NOT EXISTS idx_drivers_status ON drivers(status);
