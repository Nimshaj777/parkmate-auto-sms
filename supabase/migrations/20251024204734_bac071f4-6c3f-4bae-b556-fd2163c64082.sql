-- Create user_vehicles table for storing vehicle data
CREATE TABLE public.user_vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  registration_number text NOT NULL,
  vehicle_type text NOT NULL DEFAULT 'car',
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on user_vehicles
ALTER TABLE public.user_vehicles ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_vehicles
CREATE POLICY "Users can view their own vehicles"
  ON public.user_vehicles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vehicles"
  ON public.user_vehicles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vehicles"
  ON public.user_vehicles
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vehicles"
  ON public.user_vehicles
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create user_villas table for storing villa data
CREATE TABLE public.user_villas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  villa_id text NOT NULL,
  name text NOT NULL,
  phone_number text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, villa_id)
);

-- Enable RLS on user_villas
ALTER TABLE public.user_villas ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_villas
CREATE POLICY "Users can view their own villas"
  ON public.user_villas
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own villas"
  ON public.user_villas
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own villas"
  ON public.user_villas
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own villas"
  ON public.user_villas
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create user_automation_schedules table
CREATE TABLE public.user_automation_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  villa_id text NOT NULL,
  vehicle_id text NOT NULL,
  days_of_week integer[] NOT NULL,
  time text NOT NULL,
  duration integer NOT NULL,
  is_enabled boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on user_automation_schedules
ALTER TABLE public.user_automation_schedules ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_automation_schedules
CREATE POLICY "Users can view their own schedules"
  ON public.user_automation_schedules
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own schedules"
  ON public.user_automation_schedules
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own schedules"
  ON public.user_automation_schedules
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own schedules"
  ON public.user_automation_schedules
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create user_settings table
CREATE TABLE public.user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  language text NOT NULL DEFAULT 'en',
  time_format text NOT NULL DEFAULT '12h',
  notifications_enabled boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on user_settings
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_settings
CREATE POLICY "Users can view their own settings"
  ON public.user_settings
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
  ON public.user_settings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON public.user_settings
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_user_vehicles_user_id ON public.user_vehicles(user_id);
CREATE INDEX idx_user_villas_user_id ON public.user_villas(user_id);
CREATE INDEX idx_user_automation_schedules_user_id ON public.user_automation_schedules(user_id);
CREATE INDEX idx_user_settings_user_id ON public.user_settings(user_id);

-- Create update trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at columns
CREATE TRIGGER update_user_vehicles_updated_at
  BEFORE UPDATE ON public.user_vehicles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_villas_updated_at
  BEFORE UPDATE ON public.user_villas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_automation_schedules_updated_at
  BEFORE UPDATE ON public.user_automation_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();