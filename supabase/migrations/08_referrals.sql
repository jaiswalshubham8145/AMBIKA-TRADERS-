-- 08_referrals.sql
-- Referral code system

CREATE TABLE IF NOT EXISTS referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  referrer_email TEXT NOT NULL,
  referrer_name TEXT,
  referred_email TEXT,
  referred_name TEXT,
  order_id UUID REFERENCES orders(id),
  discount_applied NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  redeemed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(code);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_email);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);

-- Seed a couple of test referral codes
INSERT INTO referrals (code, referrer_email, referrer_name, status) VALUES
  ('FRIEND-50', 'test@example.com', 'Test User', 'pending'),
  ('FESTIVE100', 'another@example.com', 'Another User', 'pending')
ON CONFLICT (code) DO NOTHING;
