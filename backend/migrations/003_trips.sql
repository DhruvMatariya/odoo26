-- Trips table: scoped to organisation via organisation_id (same as vehicles)
-- Run this on an existing database.

CREATE TABLE IF NOT EXISTS trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL,
  driver_id UUID NOT NULL,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Dispatched', 'Completed', 'Cancelled')),
  departure_time TIMESTAMPTZ,
  eta TIMESTAMPTZ,
  cargo_weight INTEGER NOT NULL DEFAULT 0 CHECK (cargo_weight >= 0),
  estimated_cost INTEGER NOT NULL DEFAULT 0 CHECK (estimated_cost >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trips_organisation_id ON trips(organisation_id);
CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);
CREATE INDEX IF NOT EXISTS idx_trips_vehicle_id ON trips(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_trips_driver_id ON trips(driver_id);
