/*
  # Create lead webhooks table

  1. New Tables
    - `lead_webhooks`
      - `id` (uuid, primary key)
      - `session_id` (text)
      - `name` (text, not null)
      - `email` (text, not null)
      - `whatsapp` (text, optional)
      - `user_agent` (text)
      - `fbclid` (text)
      - `_fbc` (text)
      - `_fbp` (text)
      - `utm_source` (text)
      - `utm_medium` (text)
      - `utm_campaign` (text)
      - `utm_content` (text)
      - `utm_term` (text)
      - `referrer` (text)
      - `current_url` (text)
      - `quiz_answers` (jsonb)
      - `bucket_id` (text)
      - `event_type` (text, default 'InitiateCheckout')
      - `value` (decimal, default 15.0)
      - `currency` (text, default 'USD')
      - `client_ip` (text)
      - `timestamp` (timestamptz, default now())
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `lead_webhooks` table
    - Add policy for service role access
*/

CREATE TABLE IF NOT EXISTS lead_webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text,
  name text NOT NULL,
  email text NOT NULL,
  whatsapp text,
  user_agent text,
  fbclid text,
  _fbc text,
  _fbp text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  referrer text,
  current_url text,
  quiz_answers jsonb DEFAULT '{}',
  bucket_id text,
  event_type text DEFAULT 'InitiateCheckout',
  value decimal DEFAULT 15.0,
  currency text DEFAULT 'USD',
  client_ip text,
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE lead_webhooks ENABLE ROW LEVEL SECURITY;

-- Policy for service role access (backend API)
CREATE POLICY "Service role can manage lead webhooks"
  ON lead_webhooks
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Index for better performance
CREATE INDEX IF NOT EXISTS idx_lead_webhooks_email ON lead_webhooks(email);
CREATE INDEX IF NOT EXISTS idx_lead_webhooks_created_at ON lead_webhooks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lead_webhooks_session_id ON lead_webhooks(session_id);