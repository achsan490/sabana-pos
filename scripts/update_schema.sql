ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS customer_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS customer_address TEXT;

-- Update status check constraint to include 'pending'
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (status IN ('completed', 'cancelled', 'pending'));

-- Update payment_method check constraint to include 'pending' (optional, or just use cash/transfer as intent)
-- Let's keep payment_method strict for now, assuming user selects intent.
