-- Service Attendance Table Schema Update
-- Run this SQL in Supabase SQL Editor

-- Add new columns to service_attendance table
ALTER TABLE public.service_attendance 
ADD COLUMN IF NOT EXISTS babies_count INTEGER NOT NULL DEFAULT 0 CHECK (babies_count >= 0),
ADD COLUMN IF NOT EXISTS new_people_count INTEGER NOT NULL DEFAULT 0 CHECK (new_people_count >= 0);

-- Update the total_count generated column to exclude new_people_count
ALTER TABLE public.service_attendance 
DROP COLUMN IF EXISTS total_count;

ALTER TABLE public.service_attendance 
ADD COLUMN total_count INTEGER GENERATED ALWAYS AS (
  adults_count + teens_count + kids_count + babies_count
) STORED;

-- Add comments
COMMENT ON COLUMN public.service_attendance.babies_count IS 'Number of babies in attendance';
COMMENT ON COLUMN public.service_attendance.new_people_count IS 'Number of new people (adults or teens) in attendance';
COMMENT ON COLUMN public.service_attendance.total_count IS 'Auto-calculated total (adults + teens + kids + babies, excluding new people)';

