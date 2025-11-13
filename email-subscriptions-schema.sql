-- Add email subscription fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email_subscribe_announcements BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS email_subscribe_events BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS email_subscribe_devotionals BOOLEAN DEFAULT true;

-- Create index for efficient querying of subscribers
CREATE INDEX IF NOT EXISTS idx_profiles_email_subscriptions 
ON public.profiles(email_subscribe_announcements, email_subscribe_events, email_subscribe_devotionals)
WHERE email_subscribe_announcements = true OR email_subscribe_events = true OR email_subscribe_devotionals = true;

