-- Add Order Numbers
-- Adds a sequential order_number column to the orders table

-- Add order_number column with SERIAL (auto-increment)
ALTER TABLE orders ADD COLUMN order_number SERIAL;

-- Backfill existing orders with sequential numbers based on created_at
UPDATE orders
SET order_number = subquery.row_num
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as row_num
  FROM orders
) AS subquery
WHERE orders.id = subquery.id;

-- Make order_number NOT NULL now that it's populated
ALTER TABLE orders ALTER COLUMN order_number SET NOT NULL;

-- Add index for faster lookups by order number
CREATE INDEX idx_orders_order_number ON orders(order_number);
