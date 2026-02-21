-- Expenses table: scoped to organisation via organisation_id (same as vehicles/trips/maintenance)
-- Run this on an existing database.

CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  trip_id UUID NOT NULL,
  fuel_amount INTEGER NOT NULL DEFAULT 0 CHECK (fuel_amount >= 0),
  fuel_cost INTEGER NOT NULL DEFAULT 0 CHECK (fuel_cost >= 0),
  other_expense INTEGER NOT NULL DEFAULT 0 CHECK (other_expense >= 0),
  expense_note TEXT NOT NULL DEFAULT '',
  date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_expenses_organisation_id ON expenses(organisation_id);
CREATE INDEX IF NOT EXISTS idx_expenses_trip_id ON expenses(trip_id);
