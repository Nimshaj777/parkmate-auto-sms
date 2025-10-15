-- Update user_subscriptions to require user_id (if not already set)
ALTER TABLE public.user_subscriptions
ALTER COLUMN user_id SET DEFAULT auth.uid();

-- Set user_id for existing records if null
UPDATE public.user_subscriptions
SET user_id = (SELECT id FROM auth.users LIMIT 1)
WHERE user_id IS NULL;

-- Make user_id NOT NULL
ALTER TABLE public.user_subscriptions
ALTER COLUMN user_id SET NOT NULL;

-- Add user_id to villa_subscriptions if not exists
ALTER TABLE public.villa_subscriptions
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_villa_subscriptions_user_id ON public.villa_subscriptions(user_id);