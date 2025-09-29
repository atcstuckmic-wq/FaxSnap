/*
  # Token Expiration System

  1. New Tables
    - `user_tokens` - Individual token tracking with expiration dates
    - `token_transactions` - Audit trail for token additions/usage

  2. Changes
    - Modify profiles table to remove simple token count
    - Add view for active (non-expired) token count
    - Add cleanup function for expired tokens

  3. Security
    - Enable RLS on new tables
    - Add policies for user data access
*/

-- Create user_tokens table for individual token tracking
CREATE TABLE IF NOT EXISTS user_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  purchase_id uuid REFERENCES token_purchases(id),
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create token_transactions table for audit trail
CREATE TABLE IF NOT EXISTS token_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('purchase', 'usage', 'expiration')),
  tokens_count integer NOT NULL,
  reference_id uuid, -- Can reference purchase_id or fax_id
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_transactions ENABLE ROW LEVEL SECURITY;

-- User tokens policies
CREATE POLICY "Users can read own tokens"
  ON user_tokens
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own tokens"
  ON user_tokens
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Token transactions policies
CREATE POLICY "Users can read own transactions"
  ON token_transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service can manage all tokens"
  ON user_tokens
  FOR ALL
  TO service_role;

CREATE POLICY "Service can manage all transactions"
  ON token_transactions
  FOR ALL
  TO service_role;

-- Function to get active token count for a user
CREATE OR REPLACE FUNCTION get_active_token_count(user_uuid uuid)
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COUNT(*)::integer
  FROM user_tokens
  WHERE user_id = user_uuid
    AND expires_at > now()
    AND used_at IS NULL;
$$;

-- Function to use tokens (mark oldest unused tokens as used)
CREATE OR REPLACE FUNCTION use_tokens(user_uuid uuid, tokens_needed integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  available_tokens integer;
  tokens_to_use integer;
BEGIN
  -- Check if user has enough tokens
  available_tokens := get_active_token_count(user_uuid);
  
  IF available_tokens < tokens_needed THEN
    RETURN false;
  END IF;

  -- Mark oldest unused tokens as used
  UPDATE user_tokens
  SET used_at = now()
  WHERE id IN (
    SELECT id
    FROM user_tokens
    WHERE user_id = user_uuid
      AND expires_at > now()
      AND used_at IS NULL
    ORDER BY created_at ASC
    LIMIT tokens_needed
  );

  -- Log the transaction
  INSERT INTO token_transactions (user_id, transaction_type, tokens_count)
  VALUES (user_uuid, 'usage', tokens_needed);

  RETURN true;
END;
$$;

-- Function to add tokens after purchase
CREATE OR REPLACE FUNCTION add_tokens_after_purchase()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  i integer;
BEGIN
  -- Only process completed purchases
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Create individual token records (each expires 6 months from now)
    FOR i IN 1..NEW.tokens_count LOOP
      INSERT INTO user_tokens (user_id, purchase_id, expires_at)
      VALUES (NEW.user_id, NEW.id, now() + interval '6 months');
    END LOOP;

    -- Log the transaction
    INSERT INTO token_transactions (user_id, transaction_type, tokens_count, reference_id)
    VALUES (NEW.user_id, 'purchase', NEW.tokens_count, NEW.id);
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger for token purchase completion
DROP TRIGGER IF EXISTS on_token_purchase_completed ON token_purchases;
CREATE TRIGGER on_token_purchase_completed
  AFTER UPDATE ON token_purchases
  FOR EACH ROW
  EXECUTE FUNCTION add_tokens_after_purchase();

-- Function to clean up expired tokens (run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  expired_count integer;
BEGIN
  -- Count expired tokens for logging
  SELECT COUNT(*) INTO expired_count
  FROM user_tokens
  WHERE expires_at <= now() AND used_at IS NULL;

  -- Log expiration transactions
  INSERT INTO token_transactions (user_id, transaction_type, tokens_count)
  SELECT user_id, 'expiration', COUNT(*)
  FROM user_tokens
  WHERE expires_at <= now() AND used_at IS NULL
  GROUP BY user_id;

  -- Mark expired tokens as used
  UPDATE user_tokens
  SET used_at = now()
  WHERE expires_at <= now() AND used_at IS NULL;

  RETURN expired_count;
END;
$$;

-- Create view for user profile with active token count
CREATE OR REPLACE VIEW user_profiles_with_tokens AS
SELECT 
  p.*,
  get_active_token_count(p.id) as active_tokens
FROM profiles p;

-- Update profiles table to remove the simple tokens column (optional migration)
-- We'll keep it for backward compatibility and sync it with active tokens
CREATE OR REPLACE FUNCTION sync_profile_token_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update the tokens column in profiles to match active token count
  UPDATE profiles
  SET tokens = get_active_token_count(NEW.user_id)
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$;

-- Triggers to keep profile token count in sync
DROP TRIGGER IF EXISTS sync_tokens_on_insert ON user_tokens;
CREATE TRIGGER sync_tokens_on_insert
  AFTER INSERT ON user_tokens
  FOR EACH ROW
  EXECUTE FUNCTION sync_profile_token_count();

DROP TRIGGER IF EXISTS sync_tokens_on_update ON user_tokens;
CREATE TRIGGER sync_tokens_on_update
  AFTER UPDATE ON user_tokens
  FOR EACH ROW
  EXECUTE FUNCTION sync_profile_token_count();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_tokens_user_id ON user_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tokens_expires_at ON user_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_tokens_used_at ON user_tokens(used_at);
CREATE INDEX IF NOT EXISTS idx_token_transactions_user_id ON token_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_token_transactions_created_at ON token_transactions(created_at DESC);