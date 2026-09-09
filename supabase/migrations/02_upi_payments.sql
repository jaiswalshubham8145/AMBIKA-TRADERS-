-- ==============================================================================
-- Migration: 02_upi_payments.sql
-- Direct UPI Payment Workflow: UTR / Reference ID & Verification Support
-- ==============================================================================

-- 1. Add transaction_id (UTR) and payment_screenshot_url to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS transaction_id TEXT,
ADD COLUMN IF NOT EXISTS payment_screenshot_url TEXT;

-- 2. Create index on transaction_id for quick admin lookups
CREATE INDEX IF NOT EXISTS idx_orders_transaction_id ON public.orders(transaction_id);

-- 3. Update payment_status comment to document state machine:
-- UNPAID: Order initiated but no payment attempted
-- VERIFICATION_PENDING: Customer transferred funds via UPI and submitted 12-digit UTR
-- PAID: Admin verified UTR in banking app and confirmed order
-- FAILED: Admin rejected invalid UTR or transaction was cancelled
COMMENT ON COLUMN public.orders.payment_status IS 'Payment states: UNPAID, VERIFICATION_PENDING, PAID, FAILED, REFUNDED';
