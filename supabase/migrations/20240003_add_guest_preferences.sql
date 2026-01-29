-- Add Guest Preferences
-- Stores guest preferences for auto-populating notes

CREATE TABLE IF NOT EXISTS guest_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_name TEXT NOT NULL,
  preferences TEXT NOT NULL,
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups by guest name
CREATE INDEX idx_guest_preferences_name ON guest_preferences(guest_name);

-- Create unique constraint to prevent duplicate guest names
CREATE UNIQUE INDEX idx_guest_preferences_unique_name ON guest_preferences(LOWER(guest_name));
