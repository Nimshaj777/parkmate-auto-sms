import { Device } from '@capacitor/device';
import { LocalNotifications } from '@capacitor/local-notifications';
import type { Vehicle, SMSStatus } from '@/types';

export class SMSService {
  private static async requestPermissions() {
    try {
      // Request SMS and notification permissions
      await LocalNotifications.requestPermissions();
      return true;
    } catch (error) {
      console.error('Permission request failed:', error);
      return false;
    }
  }

  static async sendSMS(phoneNumber: string, message: string): Promise<boolean> {
    try {
      // Check if device supports SMS
      const info = await Device.getInfo();
      if (info.platform !== 'android') {
        throw new Error('SMS sending is only supported on Android devices');
      }

      // For now, we'll simulate SMS sending with native Android intent
      // In production, you'd use a Capacitor SMS plugin or native code
      console.log(`Sending SMS to ${phoneNumber}: ${message}`);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Return success (in production, this would be based on actual SMS API response)
      return Math.random() > 0.1; // 90% success rate for demo
    } catch (error) {
      console.error('SMS sending failed:', error);
      return false;
    }
  }

  static async sendAllVehicleSMS(vehicles: Vehicle[], governmentNumber: string): Promise<SMSStatus[]> {
    await this.requestPermissions();
    
    const results: SMSStatus[] = [];
    
    for (const vehicle of vehicles) {
      try {
        const success = await this.sendSMS(governmentNumber, vehicle.smsMessage);
        
        const status: SMSStatus = {
          vehicleId: vehicle.id,
          status: success ? 'sent' : 'failed',
          sentAt: new Date(),
          message: success ? 'SMS sent successfully' : 'Failed to send SMS'
        };
        
        results.push(status);
        
        // Small delay between messages
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        results.push({
          vehicleId: vehicle.id,
          status: 'failed',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    // Show completion notification
    await this.showNotification(
      'SMS Batch Complete',
      `Sent ${results.filter(r => r.status === 'sent').length}/${results.length} messages`
    );
    
    return results;
  }

  private static async showNotification(title: string, body: string) {
    try {
      await LocalNotifications.schedule({
        notifications: [{
          id: Date.now(),
          title,
          body,
          schedule: { at: new Date(Date.now() + 100) }
        }]
      });
    } catch (error) {
      console.error('Notification failed:', error);
    }
  }

  static validateActivationCode(code: string): boolean {
    // Simple validation - in production, this would verify with your server
    const pattern = /^PK\d{6}[A-Z]{2}$/; // Format: PK123456AB
    return pattern.test(code);
  }

  static generateActivationCode(): string {
    // Generate a code in format PK123456AB
    const numbers = Math.floor(Math.random() * 900000) + 100000;
    const letters = String.fromCharCode(65 + Math.floor(Math.random() * 26)) +
                   String.fromCharCode(65 + Math.floor(Math.random() * 26));
    return `PK${numbers}${letters}`;
  }
}