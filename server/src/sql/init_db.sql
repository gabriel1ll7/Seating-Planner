-- Create the 'venues' table
CREATE TABLE IF NOT EXISTS venues (
    slug TEXT PRIMARY KEY,
    venue_data JSONB NOT NULL,
    hashed_pin TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create or replace the trigger function to automatically update updated_at
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger to call the function before any update on the 'venues' table
-- Drop the trigger first if it exists, to make the script idempotent
DROP TRIGGER IF EXISTS set_timestamp_trigger ON venues;
CREATE TRIGGER set_timestamp_trigger
BEFORE UPDATE ON venues
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Optional: Add some initial seed data or indexes if needed
-- Example: CREATE INDEX IF NOT EXISTS idx_venues_created_at ON venues(created_at DESC);

-- Grant permissions if necessary (depending on your DB user setup)
-- Example: GRANT ALL PRIVILEGES ON TABLE venues TO myuser;
-- Example: GRANT USAGE, SELECT ON SEQUENCE venues_id_seq TO myuser; (if using SERIAL for ID)


-- Note: This script is designed to be run multiple times without error (idempotent).
-- IF NOT EXISTS is used for table creation.
-- CREATE OR REPLACE is used for function creation.
-- DROP TRIGGER IF EXISTS is used before creating the trigger.

SELECT 'Database initialization script completed.'; 