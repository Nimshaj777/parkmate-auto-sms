-- Create villa_subscriptions table for per-villa subscription tracking
CREATE TABLE IF NOT EXISTS public.villa_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  villa_id TEXT NOT NULL UNIQUE,
  device_id TEXT NOT NULL,
  activation_code TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  activated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.villa_subscriptions ENABLE ROW LEVEL SECURITY;

-- Anyone can check their villa subscriptions by device_id
CREATE POLICY "Users can view their villa subscriptions"
ON public.villa_subscriptions
FOR SELECT
USING (device_id = ((current_setting('request.headers'::text, true))::json ->> 'x-device-id'::text));

-- Anyone can insert villa subscriptions for their device
CREATE POLICY "Users can activate villa subscriptions"
ON public.villa_subscriptions
FOR INSERT
WITH CHECK (device_id = ((current_setting('request.headers'::text, true))::json ->> 'x-device-id'::text));

-- Anyone can update their villa subscriptions
CREATE POLICY "Users can update their villa subscriptions"
ON public.villa_subscriptions
FOR UPDATE
USING (device_id = ((current_setting('request.headers'::text, true))::json ->> 'x-device-id'::text));

-- Admins can view all villa subscriptions
CREATE POLICY "Admins can view all villa subscriptions"
ON public.villa_subscriptions
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Update activation_codes to support per-villa codes
-- Change villa_count default to 1 for per-villa model
ALTER TABLE public.activation_codes 
ALTER COLUMN villa_count SET DEFAULT 1;

-- Add max_vehicles column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'activation_codes' 
    AND column_name = 'max_vehicles'
  ) THEN
    ALTER TABLE public.activation_codes 
    ADD COLUMN max_vehicles INTEGER NOT NULL DEFAULT 20;
  END IF;
END $$;