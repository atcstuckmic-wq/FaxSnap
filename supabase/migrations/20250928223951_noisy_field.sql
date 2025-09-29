/*
  # FaxSnap Database Schema

  1. New Tables
    - `profiles` - User profiles with token balance
    - `faxes` - Fax records and status tracking
    - `token_purchases` - Token purchase history
    - `fax_webhooks` - Webhook events from Telnyx

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data

  3. Functions
    - Trigger to create profile on user signup
    - Function to handle token purchases
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users(id) PRIMARY KEY,
  email text NOT NULL,
  tokens integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create faxes table
CREATE TABLE IF NOT EXISTS faxes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  recipient_number text NOT NULL,
  document_url text NOT NULL,
  cover_message text,
  telnyx_fax_id text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'sending', 'delivered', 'failed')),
  tokens_used integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create token_purchases table
CREATE TABLE IF NOT EXISTS token_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  stripe_payment_intent_id text UNIQUE NOT NULL,
  tokens_count integer NOT NULL,
  amount_cents integer NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create fax_webhooks table for tracking Telnyx webhooks
CREATE TABLE IF NOT EXISTS fax_webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  telnyx_fax_id text NOT NULL,
  event_type text NOT NULL,
  status text,
  payload jsonb NOT NULL,
  processed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE faxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE fax_webhooks ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Faxes policies
CREATE POLICY "Users can read own faxes"
  ON faxes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own faxes"
  ON faxes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own faxes"
  ON faxes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Token purchases policies
CREATE POLICY "Users can read own purchases"
  ON token_purchases
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own purchases"
  ON token_purchases
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Webhook policies (service role only)
CREATE POLICY "Service role can manage webhooks"
  ON fax_webhooks
  FOR ALL
  TO service_role;

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email, tokens)
  VALUES (NEW.id, NEW.email, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_faxes_updated_at
  BEFORE UPDATE ON faxes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_token_purchases_updated_at
  BEFORE UPDATE ON token_purchases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_faxes_user_id ON faxes(user_id);
CREATE INDEX IF NOT EXISTS idx_faxes_created_at ON faxes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_token_purchases_user_id ON token_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_fax_webhooks_telnyx_id ON fax_webhooks(telnyx_fax_id);