-- Add villa_count to activation_codes table
ALTER TABLE public.activation_codes 
ADD COLUMN IF NOT EXISTS villa_count integer NOT NULL DEFAULT 1;

-- Add villa_limit to user_subscriptions table
ALTER TABLE public.user_subscriptions 
ADD COLUMN IF NOT EXISTS villa_limit integer NOT NULL DEFAULT 1;

-- Add comment for clarity
COMMENT ON COLUMN public.activation_codes.villa_count IS 'Number of villas this activation code grants access to';
COMMENT ON COLUMN public.user_subscriptions.villa_limit IS 'Maximum number of villas the user can create with this subscription';