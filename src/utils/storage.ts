import { Storage } from '@capacitor/storage';
import type { Vehicle, AppSettings, SubscriptionStatus } from '@/types';

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
        governmentNumber: '3009',
        notificationsEnabled: true
      };
    } catch (error) {
      console.error('Error getting settings:', error);
      return {
        language: 'en',
        governmentNumber: '3009',
        notificationsEnabled: true
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
        isActive: true, // 7-day trial
        type: 'trial',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      };
    } catch (error) {
      console.error('Error getting subscription:', error);
      return {
        isActive: true,
        type: 'trial',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      };
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
}