-- 06_cart_events.sql
-- Cart analytics & abandoned cart recovery

CREATE TABLE IF NOT EXISTS cart_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('add', 'remove', 'checkout_start', 'checkout_complete', 'abandoned')),
  product_slug TEXT,
  product_title TEXT,
  product_price NUMERIC,
  quantity INTEGER DEFAULT 1,
  cart_value NUMERIC,
  user_email TEXT,
  user_phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cart_events_session ON cart_events(session_id);
CREATE INDEX IF NOT EXISTS idx_cart_events_type ON cart_events(event_type);
CREATE INDEX IF NOT EXISTS idx_cart_events_created ON cart_events(created_at);
CREATE INDEX IF NOT EXISTS idx_cart_events_abandoned ON cart_events(event_type, created_at) WHERE event_type = 'abandoned';

-- View: cart abandonment summary by session
CREATE OR REPLACE VIEW cart_abandonment_summary AS
SELECT
  session_id,
  MAX(created_at) AS last_event_at,
  SUM(CASE WHEN event_type = 'add' THEN cart_value ELSE 0 END) AS total_cart_value,
  COUNT(DISTINCT product_slug) AS unique_products,
  MAX(user_email) AS user_email,
  MAX(user_phone) AS user_phone,
  BOOL_OR(event_type = 'checkout_complete') AS completed,
  BOOL_OR(event_type = 'abandoned') AS marked_abandoned
FROM cart_events
GROUP BY session_id
HAVING NOT BOOL_OR(event_type = 'checkout_complete')
  AND MAX(created_at) < NOW() - INTERVAL '30 minutes';
