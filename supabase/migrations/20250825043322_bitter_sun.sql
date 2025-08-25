/*
  # Create purchase webhooks table

  1. New Tables
    - `purchase_webhooks`
      - `id` (uuid, primary key)
      - `session_id` (text)
      - `name` (text, not null)
      - `email` (text, not null)
      - `whatsapp` (text, optional)
      - `transaction_id` (text, not null)
      - `order_id` (text)
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
      - `event_type` (text, default 'Purchase')
      - `value` (decimal, default 15.0)
      - `currency` (text, default 'USD')
      - `payment_method` (text, default 'hotmart')
      - `client_ip` (text)
      - `timestamp` (timestamptz, default now())
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `purchase_webhooks` table
    - Add policy for service role access
*/

CREATE TABLE IF NOT EXISTS purchase_webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text,
  name text NOT NULL,
  email text NOT NULL,
  whatsapp text,
  transaction_id text NOT NULL,
  order_id text,
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
  event_type text DEFAULT 'Purchase',
  value decimal DEFAULT 15.0,
  currency text DEFAULT 'USD',
  payment_method text DEFAULT 'hotmart',
  client_ip text,
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE purchase_webhooks ENABLE ROW LEVEL SECURITY;

-- Policy for service role access (backend API)
CREATE POLICY "Service role can manage purchase webhooks"
  ON purchase_webhooks
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Index for better performance
CREATE INDEX IF NOT EXISTS idx_purchase_webhooks_email ON purchase_webhooks(email);
CREATE INDEX IF NOT EXISTS idx_purchase_webhooks_transaction_id ON purchase_webhooks(transaction_id);
CREATE INDEX IF NOT EXISTS idx_purchase_webhooks_created_at ON purchase_webhooks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_purchase_webhooks_session_id ON purchase_webhooks(session_id);