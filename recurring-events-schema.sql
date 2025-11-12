-- Recurring Events Schema Migration
-- Run this SQL in Supabase SQL Editor

-- Add recurrence fields to events table
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS recurrence_type TEXT CHECK (recurrence_type IN ('weekly', 'biweekly', 'monthly', 'annually')),
ADD COLUMN IF NOT EXISTS recurrence_pattern TEXT CHECK (recurrence_pattern IN ('days', 'dates')),
ADD COLUMN IF NOT EXISTS recurrence_days INTEGER[], -- Array of day numbers (0=Sunday, 1=Monday, ..., 6=Saturday)
ADD COLUMN IF NOT EXISTS recurrence_dates INTEGER[], -- Array of dates (1-31 for monthly, 1-365 for annually)
ADD COLUMN IF NOT EXISTS recurrence_end_date TIMESTAMPTZ, -- Optional end date for recurrence
ADD COLUMN IF NOT EXISTS recurrence_start_date TIMESTAMPTZ; -- Original start date for the recurrence pattern

-- Add comments for documentation
COMMENT ON COLUMN public.events.is_recurring IS 'Whether this event repeats on a schedule';
COMMENT ON COLUMN public.events.recurrence_type IS 'How often the event repeats: weekly, biweekly, monthly, or annually';
COMMENT ON COLUMN public.events.recurrence_pattern IS 'Pattern type: days (e.g., every Sunday) or dates (e.g., 1st of month)';
COMMENT ON COLUMN public.events.recurrence_days IS 'Array of day numbers (0=Sunday, 1=Monday, ..., 6=Saturday) for day-based recurrence';
COMMENT ON COLUMN public.events.recurrence_dates IS 'Array of dates (1-31) for monthly or day-of-year (1-365) for annual date-based recurrence';
COMMENT ON COLUMN public.events.recurrence_end_date IS 'Optional date when the recurrence stops';
COMMENT ON COLUMN public.events.recurrence_start_date IS 'Original start date used as reference for calculating next occurrence';

-- Create index for better query performance on recurring events
CREATE INDEX IF NOT EXISTS idx_events_is_recurring ON public.events(is_recurring) WHERE is_recurring = true;

