import { supabase } from "@/integrations/supabase/client";
import type { Vehicle, Villa, AutomationSchedule, AppSettings } from "@/types";
import { VillaSubscriptionAPI } from "./villaSubscriptionApi";

export class DatabaseAPI {
  // Vehicles Management
  
  static async getVehicles(): Promise<Vehicle[]> {
    try {
      const deviceId = await VillaSubscriptionAPI.getDeviceId();

      const { data, error } = await supabase
        .from('user_vehicles')
        .select('*')
        .eq('device_id', deviceId);

      if (error) {
        console.error('Error fetching vehicles:', error);
        return [];
      }

      return (data || []).map(v => ({
        id: v.id,
        plateNumber: v.registration_number,
        roomName: '', // Not stored in DB yet
        smsMessage: '', // Not stored in DB yet
        status: 'pending' as const,
        villaId: '', // Not stored in DB yet
        serialNumber: 0, // Not stored in DB yet
        createdAt: new Date(v.created_at),
        updatedAt: new Date(v.updated_at)
      }));
    } catch (error) {
      console.error('Error in getVehicles:', error);
      return [];
    }
  }

  static async addVehicle(
    registrationNumber: string, 
    vehicleType: string = 'car',
    isDefault: boolean = false
  ): Promise<void> {
    try {
      const deviceId = await VillaSubscriptionAPI.getDeviceId();

      const { error } = await supabase
        .from('user_vehicles')
        .insert([{
          device_id: deviceId,
          registration_number: registrationNumber,
          vehicle_type: vehicleType,
          is_default: isDefault,
        }]);

      if (error) {
        console.error('Error adding vehicle:', error);
        throw new Error('Failed to add vehicle');
      }
    } catch (error) {
      console.error('Error in addVehicle:', error);
      throw error;
    }
  }

  static async updateVehicle(vehicleId: string, updates: { registration_number?: string; vehicle_type?: string; is_default?: boolean }): Promise<void> {
    const { error } = await supabase
      .from('user_vehicles')
      .update(updates)
      .eq('id', vehicleId);

    if (error) {
      console.error('Error updating vehicle:', error);
      throw new Error('Failed to update vehicle');
    }
  }

  static async deleteVehicle(vehicleId: string): Promise<void> {
    const { error } = await supabase
      .from('user_vehicles')
      .delete()
      .eq('id', vehicleId);

    if (error) {
      console.error('Error deleting vehicle:', error);
      throw new Error('Failed to delete vehicle');
    }
  }

  // Villas Management
  
  static async getVillas(): Promise<Villa[]> {
    try {
      const deviceId = await VillaSubscriptionAPI.getDeviceId();

      const { data, error } = await supabase
        .from('user_villas')
        .select('*')
        .eq('device_id', deviceId);

      if (error) {
        console.error('Error fetching villas:', error);
        return [];
      }

      return (data || []).map(v => ({
        id: v.villa_id,
        name: v.name,
        defaultSmsNumber: v.phone_number,
        createdAt: new Date(v.created_at),
        updatedAt: new Date(v.updated_at)
      }));
    } catch (error) {
      console.error('Error in getVillas:', error);
      return [];
    }
  }

  static async addVilla(
    villaId: string,
    name: string,
    phoneNumber: string
  ): Promise<void> {
    try {
      const deviceId = await VillaSubscriptionAPI.getDeviceId();

      const { error } = await supabase
        .from('user_villas')
        .insert([{
          device_id: deviceId,
          villa_id: villaId,
          name: name,
          phone_number: phoneNumber,
        }]);

      if (error) {
        console.error('Error adding villa:', error);
        throw new Error('Failed to add villa');
      }
    } catch (error) {
      console.error('Error in addVilla:', error);
      throw error;
    }
  }

  static async updateVilla(villaId: string, updates: { name?: string; phone_number?: string; is_active?: boolean }): Promise<void> {
    const { error } = await supabase
      .from('user_villas')
      .update(updates)
      .eq('villa_id', villaId);

    if (error) {
      console.error('Error updating villa:', error);
      throw new Error('Failed to update villa');
    }
  }

  static async deleteVilla(villaId: string): Promise<void> {
    const { error } = await supabase
      .from('user_villas')
      .delete()
      .eq('villa_id', villaId);

    if (error) {
      console.error('Error deleting villa:', error);
      throw new Error('Failed to delete villa');
    }
  }

  // Automation Schedules Management
  
  static async getAutomationSchedules(): Promise<AutomationSchedule[]> {
    try {
      const deviceId = await VillaSubscriptionAPI.getDeviceId();

      const { data, error } = await supabase
        .from('user_automation_schedules')
        .select('*')
        .eq('device_id', deviceId);

      if (error) {
        console.error('Error fetching schedules:', error);
        return [];
      }

      return (data || []).map(s => ({
        id: s.id,
        villaId: s.villa_id,
        enabled: s.is_enabled,
        time: s.time,
        daysOfWeek: s.days_of_week.map((d: number) => d === 1), // Convert array of ints to booleans
        createdAt: new Date(s.created_at),
        updatedAt: new Date(s.updated_at)
      }));
    } catch (error) {
      console.error('Error in getAutomationSchedules:', error);
      return [];
    }
  }

  static async addSchedule(
    villaId: string,
    vehicleId: string,
    daysOfWeek: number[],
    time: string,
    duration: number
  ): Promise<void> {
    try {
      const deviceId = await VillaSubscriptionAPI.getDeviceId();

      const { error } = await supabase
        .from('user_automation_schedules')
        .insert([{
          device_id: deviceId,
          villa_id: villaId,
          vehicle_id: vehicleId,
          days_of_week: daysOfWeek,
          time: time,
          duration: duration,
        }]);

      if (error) {
        console.error('Error adding schedule:', error);
        throw new Error('Failed to add schedule');
      }
    } catch (error) {
      console.error('Error in addSchedule:', error);
      throw error;
    }
  }

  static async updateSchedule(scheduleId: string, updates: { days_of_week?: number[]; time?: string; duration?: number; is_enabled?: boolean }): Promise<void> {
    const { error } = await supabase
      .from('user_automation_schedules')
      .update(updates)
      .eq('id', scheduleId);

    if (error) {
      console.error('Error updating schedule:', error);
      throw new Error('Failed to update schedule');
    }
  }

  static async deleteSchedule(scheduleId: string): Promise<void> {
    const { error } = await supabase
      .from('user_automation_schedules')
      .delete()
      .eq('id', scheduleId);

    if (error) {
      console.error('Error deleting schedule:', error);
      throw new Error('Failed to delete schedule');
    }
  }

  // User Settings Management
  
  static async getSettings(): Promise<AppSettings> {
    try {
      const deviceId = await VillaSubscriptionAPI.getDeviceId();

      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('device_id', deviceId)
        .maybeSingle();

      if (error || !data) {
        // Return defaults if no settings found
        return {
          language: 'en',
          defaultSmsNumber: '3009',
          notificationsEnabled: true,
          automationEnabled: false
        };
      }

      return {
        language: data.language as 'en' | 'ar' | 'hi',
        defaultSmsNumber: '3009', // Not stored in DB yet
        notificationsEnabled: data.notifications_enabled,
        automationEnabled: false // Not stored in DB yet
      };
    } catch (error) {
      console.error('Error in getSettings:', error);
      return {
        language: 'en',
        defaultSmsNumber: '3009',
        notificationsEnabled: true,
        automationEnabled: false
      };
    }
  }

  static async saveSettings(settings: AppSettings): Promise<void> {
    try {
      const deviceId = await VillaSubscriptionAPI.getDeviceId();

      const { error } = await supabase
        .from('user_settings')
        .upsert([{
          device_id: deviceId,
          language: settings.language,
          notifications_enabled: settings.notificationsEnabled,
          time_format: '12h' // Default
        }], {
          onConflict: 'device_id'
        });

      if (error) {
        console.error('Error saving settings:', error);
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error in saveSettings:', error);
      throw error;
    }
  }
}
