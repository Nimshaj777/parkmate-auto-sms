-- Fix search_path for update_updated_at_column function
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate triggers
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