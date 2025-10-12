import { Storage } from '@capacitor/storage';
import type { Vehicle, AppSettings, SubscriptionStatus, Villa, AutomationSchedule } from '@/types';

export class LocalStorage {
  private static readonly VEHICLES_KEY = 'parking_vehicles';
  private static readonly SETTINGS_KEY = 'app_settings';
  private static readonly SUBSCRIPTION_KEY = 'subscription_status';

  static async getVehicles(): Promise<Vehicle[]> {
    try {
      const { value } = await Storage.get({ key: this.VEHICLES_KEY });
      return value ? JSON.parse(value) : [];
    } catch (error) {
      console.error('Error getting vehicles:', error);
      return [];
    }
  }

  static async saveVehicles(vehicles: Vehicle[]): Promise<void> {
    try {
      await Storage.set({
        key: this.VEHICLES_KEY,
        value: JSON.stringify(vehicles)
      });
    } catch (error) {
      console.error('Error saving vehicles:', error);
    }
  }

  static async addVehicle(vehicle: Vehicle): Promise<void> {
    const vehicles = await this.getVehicles();
    vehicles.push(vehicle);
    await this.saveVehicles(vehicles);
  }

  static async updateVehicle(vehicleId: string, updates: Partial<Vehicle>): Promise<void> {
    const vehicles = await this.getVehicles();
    const index = vehicles.findIndex(v => v.id === vehicleId);
    if (index >= 0) {
      vehicles[index] = { ...vehicles[index], ...updates, updatedAt: new Date() };
      await this.saveVehicles(vehicles);
    }
  }

  static async deleteVehicle(vehicleId: string): Promise<void> {
    const vehicles = await this.getVehicles();
    const filtered = vehicles.filter(v => v.id !== vehicleId);
    await this.saveVehicles(filtered);
  }

  static async getSettings(): Promise<AppSettings> {
    try {
      const { value } = await Storage.get({ key: this.SETTINGS_KEY });
      return value ? JSON.parse(value) : {
        language: 'en',
        defaultSmsNumber: '3009',
        notificationsEnabled: true,
        automationEnabled: false
      };
    } catch (error) {
      console.error('Error getting settings:', error);
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
      await Storage.set({
        key: this.SETTINGS_KEY,
        value: JSON.stringify(settings)
      });
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }

  static async getSubscriptionStatus(): Promise<SubscriptionStatus> {
    try {
      const { value } = await Storage.get({ key: this.SUBSCRIPTION_KEY });
      return value ? JSON.parse(value) : {
        isActive: true, // 3-day trial
        type: 'trial',
        expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      };
    } catch (error) {
      console.error('Error getting subscription:', error);
      return {
        isActive: true,
        type: 'trial',
        expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      };
    }
  }

  // Villa management
  static async getVillas(): Promise<Villa[]> {
    try {
      const { value } = await Storage.get({ key: 'parking_villas' });
      return value ? JSON.parse(value) : [{
        id: 'default',
        name: 'Default Villa',
        defaultSmsNumber: '3009',
        createdAt: new Date(),
        updatedAt: new Date()
      }];
    } catch (error) {
      console.error('Error getting villas:', error);
      return [{
        id: 'default',
        name: 'Default Villa',
        defaultSmsNumber: '3009',
        createdAt: new Date(),
        updatedAt: new Date()
      }];
    }
  }

  static async saveVillas(villas: Villa[]): Promise<void> {
    try {
      await Storage.set({
        key: 'parking_villas',
        value: JSON.stringify(villas)
      });
    } catch (error) {
      console.error('Error saving villas:', error);
    }
  }

  // Automation schedules
  static async getAutomationSchedules(): Promise<AutomationSchedule[]> {
    try {
      const { value } = await Storage.get({ key: 'automation_schedules' });
      return value ? JSON.parse(value) : [];
    } catch (error) {
      console.error('Error getting schedules:', error);
      return [];
    }
  }

  static async saveAutomationSchedules(schedules: AutomationSchedule[]): Promise<void> {
    try {
      await Storage.set({
        key: 'automation_schedules',
        value: JSON.stringify(schedules)
      });
    } catch (error) {
      console.error('Error saving schedules:', error);
    }
  }

  static async saveSubscriptionStatus(status: SubscriptionStatus): Promise<void> {
    try {
      await Storage.set({
        key: this.SUBSCRIPTION_KEY,
        value: JSON.stringify(status)
      });
    } catch (error) {
      console.error('Error saving subscription:', error);
    }
  }

  // Activation codes management
  static async getActivationCodes(): Promise<import('./subscription').ActivationCode[]> {
    try {
      const { value } = await Storage.get({ key: 'activation_codes' });
      return value ? JSON.parse(value) : [];
    } catch (error) {
      console.error('Error getting activation codes:', error);
      return [];
    }
  }

  static async saveActivationCodes(codes: import('./subscription').ActivationCode[]): Promise<void> {
    try {
      await Storage.set({
        key: 'activation_codes',
        value: JSON.stringify(codes)
      });
    } catch (error) {
      console.error('Error saving activation codes:', error);
    }
  }

  // Trial devices management
  static async getTrialDevices(): Promise<import('./subscription').DeviceInfo[]> {
    try {
      const { value } = await Storage.get({ key: 'trial_devices' });
      return value ? JSON.parse(value) : [];
    } catch (error) {
      console.error('Error getting trial devices:', error);
      return [];
    }
  }

  static async saveTrialDevices(devices: import('./subscription').DeviceInfo[]): Promise<void> {
    try {
      await Storage.set({
        key: 'trial_devices',
        value: JSON.stringify(devices)
      });
    } catch (error) {
      console.error('Error saving trial devices:', error);
    }
  }

  // Trial IPs management (web only)
  static async getTrialIPs(): Promise<string[]> {
    try {
      const { value } = await Storage.get({ key: 'trial_ips' });
      return value ? JSON.parse(value) : [];
    } catch (error) {
      console.error('Error getting trial IPs:', error);
      return [];
    }
  }

  static async saveTrialIPs(ips: string[]): Promise<void> {
    try {
      await Storage.set({
        key: 'trial_ips',
        value: JSON.stringify(ips)
      });
    } catch (error) {
      console.error('Error saving trial IPs:', error);
    }
  }

  // SMS History management
  static async getSMSHistory(): Promise<import('@/types').SMSHistoryEntry[]> {
    try {
      const { value } = await Storage.get({ key: 'sms_history' });
      return value ? JSON.parse(value) : [];
    } catch (error) {
      console.error('Error getting SMS history:', error);
      return [];
    }
  }

  static async saveSMSHistory(history: import('@/types').SMSHistoryEntry[]): Promise<void> {
    try {
      await Storage.set({
        key: 'sms_history',
        value: JSON.stringify(history)
      });
    } catch (error) {
      console.error('Error saving SMS history:', error);
    }
  }

  static async logSMSToHistory(success: boolean): Promise<void> {
    try {
      const history = await this.getSMSHistory();
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      
      // Find or create today's entry
      const todayEntry = history.find(h => h.date === today);
      if (todayEntry) {
        if (success) {
          todayEntry.successful++;
        } else {
          todayEntry.errors++;
        }
      } else {
        history.push({
          date: today,
          successful: success ? 1 : 0,
          errors: success ? 0 : 1
        });
      }
      
      // Keep only last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const filtered = history.filter(h => new Date(h.date) >= thirtyDaysAgo);
      
      await this.saveSMSHistory(filtered);
    } catch (error) {
      console.error('Error logging SMS to history:', error);
    }
  }
}