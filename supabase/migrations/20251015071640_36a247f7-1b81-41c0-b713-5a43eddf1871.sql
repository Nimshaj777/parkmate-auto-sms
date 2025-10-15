-- Update RLS policies to prioritize user authentication over device ID

-- Drop existing policies for trial_devices
DROP POLICY IF EXISTS "Anyone can check trial eligibility" ON public.trial_devices;
DROP POLICY IF EXISTS "Anyone can register trial usage" ON public.trial_devices;

-- Create new restricted policies for trial_devices
CREATE POLICY "Authenticated users can check their trial eligibility"
ON public.trial_devices
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can register trial usage"
ON public.trial_devices
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Update user_subscriptions to require user_id
ALTER TABLE public.user_subscriptions
ALTER COLUMN user_id SET NOT NULL;

-- Update RLS policies for user_subscriptions to prioritize auth
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can insert their own subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscriptions" ON public.user_subscriptions;

CREATE POLICY "Users can view their own subscriptions"
ON public.user_subscriptions
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own subscriptions"
ON public.user_subscriptions
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own subscriptions"
ON public.user_subscriptions
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- Update villa_subscriptions to require user_id
ALTER TABLE public.villa_subscriptions
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Update existing villa_subscriptions policies
DROP POLICY IF EXISTS "Users can view their villa subscriptions" ON public.villa_subscriptions;
DROP POLICY IF EXISTS "Users can activate villa subscriptions" ON public.villa_subscriptions;
DROP POLICY IF EXISTS "Users can update their villa subscriptions" ON public.villa_subscriptions;

CREATE POLICY "Users can view their own villa subscriptions"
ON public.villa_subscriptions
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can activate their villa subscriptions"
ON public.villa_subscriptions
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own villa subscriptions"
ON public.villa_subscriptions
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());