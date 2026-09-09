-- 07_gift_cards.sql
-- Gift card system

CREATE TABLE IF NOT EXISTS gift_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  initial_value NUMERIC NOT NULL CHECK (initial_value > 0),
  balance NUMERIC NOT NULL CHECK (balance >= 0),
  purchaser_email TEXT,
  purchaser_name TEXT,
  recipient_email TEXT,
  recipient_name TEXT,
  message TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'redeemed', 'expired', 'disabled')),
  redeemed_by_order_id UUID REFERENCES orders(id),
  redeemed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gift_cards_code ON gift_cards(code);
CREATE INDEX IF NOT EXISTS idx_gift_cards_status ON gift_cards(status);
CREATE INDEX IF NOT EXISTS idx_gift_cards_purchaser ON gift_cards(purchaser_email);

-- Seed a few denominations for testing
INSERT INTO gift_cards (code, initial_value, balance, status) VALUES
  ('GIFT-500-TEST', 500, 500, 'active'),
  ('GIFT-1000-TEST', 1000, 1000, 'active'),
  ('GIFT-2000-TEST', 2000, 2000, 'active')
ON CONFLICT (code) DO NOTHING;
