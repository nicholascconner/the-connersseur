-- Add phone_number column to orders table for guest SMS notifications
ALTER TABLE orders ADD COLUMN phone_number TEXT NULL;
