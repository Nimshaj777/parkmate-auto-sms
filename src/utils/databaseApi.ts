import { supabase } from '@/integrations/supabase/client';
import type { Vehicle, Villa, AutomationSchedule, AppSettings } from '@/types';

/**
 * Database API for user data
 * All data is stored server-side and protected by RLS policies
 */
export class DatabaseAPI {
  /**
   * VEHICLES
   */
  static async getVehicles(): Promise<Vehicle[]> {
    const { data, error } = await supabase
      .from('user_vehicles')
      .select('*')
      .order('created_at', { ascending: false });

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
  }

  static async addVehicle(registrationNumber: string, vehicleType: string = 'car', isDefault: boolean = false): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('user_vehicles')
      .insert([{
        user_id: user.id,
        registration_number: registrationNumber,
        vehicle_type: vehicleType,
        is_default: isDefault
      }]);

    if (error) {
      console.error('Error adding vehicle:', error);
      throw new Error('Failed to add vehicle');
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

  /**
   * VILLAS
   */
  static async getVillas(): Promise<Villa[]> {
    const { data, error } = await supabase
      .from('user_villas')
      .select('*')
      .order('created_at', { ascending: false });

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
  }

  static async addVilla(villaId: string, name: string, phoneNumber: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('user_villas')
      .insert([{
        user_id: user.id,
        villa_id: villaId,
        name,
        phone_number: phoneNumber,
        is_active: true
      }]);

    if (error) {
      console.error('Error adding villa:', error);
      throw new Error('Failed to add villa');
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

  /**
   * AUTOMATION SCHEDULES
   */
  static async getAutomationSchedules(): Promise<AutomationSchedule[]> {
    const { data, error } = await supabase
      .from('user_automation_schedules')
      .select('*')
      .order('created_at', { ascending: false });

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
  }

  static async addSchedule(villaId: string, vehicleId: string, daysOfWeek: number[], time: string, duration: number): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('user_automation_schedules')
      .insert([{
        user_id: user.id,
        villa_id: villaId,
        vehicle_id: vehicleId,
        days_of_week: daysOfWeek,
        time,
        duration,
        is_enabled: true
      }]);

    if (error) {
      console.error('Error adding schedule:', error);
      throw new Error('Failed to add schedule');
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

  /**
   * USER SETTINGS
   */
  static async getSettings(): Promise<AppSettings> {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .single();

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
  }

  static async saveSettings(settings: AppSettings): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('user_settings')
      .upsert([{
        user_id: user.id,
        language: settings.language,
        notifications_enabled: settings.notificationsEnabled,
        time_format: '12h' // Default
      }]);

    if (error) {
      console.error('Error saving settings:', error);
      throw new Error('Failed to save settings');
    }
  }
}
