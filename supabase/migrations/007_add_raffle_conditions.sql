-- Add raffle_conditions text field to events table
-- Stores the conditions/rules for prize raffles associated with the event
ALTER TABLE events ADD COLUMN IF NOT EXISTS raffle_conditions TEXT DEFAULT NULL;
