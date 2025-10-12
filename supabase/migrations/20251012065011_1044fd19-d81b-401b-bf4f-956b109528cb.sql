-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Table 1: activation_codes
CREATE TABLE public.activation_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  duration INTEGER NOT NULL,
  is_used BOOLEAN DEFAULT FALSE NOT NULL,
  used_by_device_id TEXT,
  used_by_user_id UUID REFERENCES auth.users(id),
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Table 2: user_subscriptions
CREATE TABLE public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  device_id TEXT NOT NULL,
  subscription_type TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  activation_code TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Table 3: trial_devices
CREATE TABLE public.trial_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT UNIQUE NOT NULL,
  ip_fingerprint TEXT,
  has_used_trial BOOLEAN DEFAULT TRUE NOT NULL,
  trial_started_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Table 4: user_roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, role)
);

-- Create indexes for better performance
CREATE INDEX idx_activation_codes_code ON public.activation_codes(code);
CREATE INDEX idx_activation_codes_is_used ON public.activation_codes(is_used);
CREATE INDEX idx_user_subscriptions_device_id ON public.user_subscriptions(device_id);
CREATE INDEX idx_trial_devices_device_id ON public.trial_devices(device_id);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);

-- Enable Row Level Security
ALTER TABLE public.activation_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trial_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS Policies for activation_codes
CREATE POLICY "Admins can insert activation codes"
  ON public.activation_codes
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all activation codes"
  ON public.activation_codes
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update activation codes"
  ON public.activation_codes
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public can check unused codes for validation"
  ON public.activation_codes
  FOR SELECT
  USING (is_used = FALSE AND (used_by_device_id IS NULL OR used_by_device_id = ''));

-- RLS Policies for user_subscriptions
CREATE POLICY "Users can view their own subscriptions"
  ON public.user_subscriptions
  FOR SELECT
  USING (device_id = current_setting('request.headers', true)::json->>'x-device-id' OR user_id = auth.uid());

CREATE POLICY "Users can insert their own subscriptions"
  ON public.user_subscriptions
  FOR INSERT
  WITH CHECK (device_id = current_setting('request.headers', true)::json->>'x-device-id' OR user_id = auth.uid());

CREATE POLICY "Users can update their own subscriptions"
  ON public.user_subscriptions
  FOR UPDATE
  USING (device_id = current_setting('request.headers', true)::json->>'x-device-id' OR user_id = auth.uid());

CREATE POLICY "Admins can view all subscriptions"
  ON public.user_subscriptions
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for trial_devices
CREATE POLICY "Anyone can check trial eligibility"
  ON public.trial_devices
  FOR SELECT
  USING (TRUE);

CREATE POLICY "Anyone can register trial usage"
  ON public.trial_devices
  FOR INSERT
  WITH CHECK (TRUE);

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));