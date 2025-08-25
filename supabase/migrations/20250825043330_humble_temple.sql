/*
  # Create status checks table

  1. New Tables
    - `status_checks`
      - `id` (uuid, primary key)
      - `client_name` (text, not null)
      - `timestamp` (timestamptz, default now())
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `status_checks` table
    - Add policy for service role access
*/

CREATE TABLE IF NOT EXISTS status_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name text NOT NULL,
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE status_checks ENABLE ROW LEVEL SECURITY;

-- Policy for service role access (backend API)
CREATE POLICY "Service role can manage status checks"
  ON status_checks
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Index for better performance
CREATE INDEX IF NOT EXISTS idx_status_checks_created_at ON status_checks(created_at DESC);