-- Phase 1: Drop all existing RLS policies that depend on user_id
DROP POLICY IF EXISTS "Users can view their own vehicles" ON user_vehicles;
DROP POLICY IF EXISTS "Users can insert their own vehicles" ON user_vehicles;
DROP POLICY IF EXISTS "Users can update their own vehicles" ON user_vehicles;
DROP POLICY IF EXISTS "Users can delete their own vehicles" ON user_vehicles;

DROP POLICY IF EXISTS "Users can view their own villas" ON user_villas;
DROP POLICY IF EXISTS "Users can insert their own villas" ON user_villas;
DROP POLICY IF EXISTS "Users can update their own villas" ON user_villas;
DROP POLICY IF EXISTS "Users can delete their own villas" ON user_villas;

DROP POLICY IF EXISTS "Users can view their own schedules" ON user_automation_schedules;
DROP POLICY IF EXISTS "Users can insert their own schedules" ON user_automation_schedules;
DROP POLICY IF EXISTS "Users can update their own schedules" ON user_automation_schedules;
DROP POLICY IF EXISTS "Users can delete their own schedules" ON user_automation_schedules;

DROP POLICY IF EXISTS "Users can view their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON user_settings;

DROP POLICY IF EXISTS "Users can view their own subscriptions" ON user_subscriptions;
DROP POLICY IF EXISTS "Users can insert their own subscriptions" ON user_subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscriptions" ON user_subscriptions;

DROP POLICY IF EXISTS "Users can view their own villa subscriptions" ON villa_subscriptions;
DROP POLICY IF EXISTS "Users can activate their villa subscriptions" ON villa_subscriptions;
DROP POLICY IF EXISTS "Users can update their own villa subscriptions" ON villa_subscriptions;

-- Phase 2: Add device_id columns to all user tables
ALTER TABLE user_vehicles ADD COLUMN device_id TEXT;
ALTER TABLE user_villas ADD COLUMN device_id TEXT;
ALTER TABLE user_automation_schedules ADD COLUMN device_id TEXT;
ALTER TABLE user_settings ADD COLUMN device_id TEXT;

-- Phase 3: Set a temporary default for existing rows (if any)
UPDATE user_vehicles SET device_id = 'legacy-' || id::text WHERE device_id IS NULL;
UPDATE user_villas SET device_id = 'legacy-' || id::text WHERE device_id IS NULL;
UPDATE user_automation_schedules SET device_id = 'legacy-' || id::text WHERE device_id IS NULL;
UPDATE user_settings SET device_id = 'legacy-' || id::text WHERE device_id IS NULL;

-- Phase 4: Make device_id NOT NULL
ALTER TABLE user_vehicles ALTER COLUMN device_id SET NOT NULL;
ALTER TABLE user_villas ALTER COLUMN device_id SET NOT NULL;
ALTER TABLE user_automation_schedules ALTER COLUMN device_id SET NOT NULL;
ALTER TABLE user_settings ALTER COLUMN device_id SET NOT NULL;

-- Phase 5: Drop user_id columns
ALTER TABLE user_vehicles DROP COLUMN user_id;
ALTER TABLE user_villas DROP COLUMN user_id;
ALTER TABLE user_automation_schedules DROP COLUMN user_id;
ALTER TABLE user_settings DROP COLUMN user_id;

-- Phase 6: Make user_id nullable in subscription tables (keep for admin tracking)
ALTER TABLE villa_subscriptions ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE user_subscriptions ALTER COLUMN user_id DROP NOT NULL;

-- Phase 7: Create indexes on device_id for performance
CREATE INDEX idx_vehicles_device_id ON user_vehicles(device_id);
CREATE INDEX idx_villas_device_id ON user_villas(device_id);
CREATE INDEX idx_schedules_device_id ON user_automation_schedules(device_id);
CREATE INDEX idx_settings_device_id ON user_settings(device_id);

-- Phase 8: Drop unnecessary tables
DROP TABLE IF EXISTS trial_devices CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;

-- Phase 9: Disable RLS on main tables (no auth = no RLS needed)
ALTER TABLE user_vehicles DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_villas DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_automation_schedules DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings DISABLE ROW LEVEL SECURITY;

-- Phase 10: Create new public policies for subscription tables
CREATE POLICY "Public can view subscriptions by device"
ON user_subscriptions FOR SELECT
USING (true);

CREATE POLICY "Public can insert subscriptions"
ON user_subscriptions FOR INSERT
WITH CHECK (true);

CREATE POLICY "Public can update subscriptions by device"
ON user_subscriptions FOR UPDATE
USING (true);

CREATE POLICY "Public can view villa subscriptions"
ON villa_subscriptions FOR SELECT
USING (true);

CREATE POLICY "Public can create villa subscriptions"
ON villa_subscriptions FOR INSERT
WITH CHECK (true);

CREATE POLICY "Public can update villa subscriptions"
ON villa_subscriptions FOR UPDATE
USING (true);