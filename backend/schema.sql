-- Run this against your PostgreSQL database to create tables.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('manager', 'dispatcher')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE organisations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  access_code CHAR(6) NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('manager', 'dispatcher')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_organisations_access_code ON organisations(access_code);
CREATE INDEX idx_organisations_user_id ON organisations(user_id);

-- Vehicles: one per organisation (fleet)
CREATE TABLE vehicles (
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

CREATE UNIQUE INDEX idx_vehicles_org_plate ON vehicles(organisation_id, plate);
CREATE INDEX idx_vehicles_organisation_id ON vehicles(organisation_id);
CREATE INDEX idx_vehicles_status ON vehicles(status);
