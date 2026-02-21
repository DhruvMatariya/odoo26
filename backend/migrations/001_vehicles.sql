-- Run this on an existing database to add the vehicles table.
-- Safe to run if vehicles table already exists (will error harmlessly if so).

CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  model TEXT NOT NULL,
  plate TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Truck', 'Van', 'Bike')),
  capacity_kg INTEGER NOT NULL CHECK (capacity_kg >= 0),
  status TEXT NOT NULL DEFAULT 'Available' CHECK (status IN ('Available', 'On Trip', 'In Shop', 'Retired')),
  odometer_km INTEGER NOT NULL DEFAULT 0 CHECK (odometer_km >= 0),
  purchase_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_vehicles_org_plate ON vehicles(organisation_id, plate);
CREATE INDEX IF NOT EXISTS idx_vehicles_organisation_id ON vehicles(organisation_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
