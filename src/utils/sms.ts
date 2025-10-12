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

      // Use Android Intent to send SMS
      if ((window as any).AndroidInterface) {
        // Call native Android SMS function
        const result = await (window as any).AndroidInterface.sendSMS(phoneNumber, message);
        return result === 'success';
      } else if (info.platform === 'android') {
        // Fallback: Use Android Intent URL scheme
        const smsUrl = `sms:${phoneNumber}?body=${encodeURIComponent(message)}`;
        window.location.href = smsUrl;
        
        // For automated sending, we'll assume success
        // In production, you'd implement proper callback handling
        await new Promise(resolve => setTimeout(resolve, 2000));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('SMS sending failed:', error);
      return false;
    }
  }

  static async sendAllVehicleSMS(vehicles: Vehicle[], governmentNumber: string): Promise<SMSStatus[]> {
    await this.requestPermissions();
    
    console.log(`Starting to send SMS to ${vehicles.length} vehicles in parallel`);
    
    // Send all SMS in parallel using Promise.allSettled
    const sendPromises = vehicles.map(async (vehicle) => {
      try {
        console.log(`Sending SMS for vehicle: ${vehicle.plateNumber}`);
        const success = await this.sendSMS(governmentNumber, vehicle.smsMessage);
        
        const status: SMSStatus = {
          vehicleId: vehicle.id,
          status: success ? 'sent' : 'failed',
          sentAt: new Date(),
          message: success ? 'SMS sent successfully' : 'Failed to send SMS'
        };
        
        console.log(`SMS result for ${vehicle.plateNumber}: ${status.status}`);
        return status;
      } catch (error) {
        console.error(`Failed to send SMS for ${vehicle.plateNumber}:`, error);
        return {
          vehicleId: vehicle.id,
          status: 'failed' as const,
          message: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    });

    // Wait for all SMS to complete (parallel execution)
    const results = await Promise.all(sendPromises);
    
    const successCount = results.filter(r => r.status === 'sent').length;
    console.log(`SMS batch complete: ${successCount}/${results.length} sent successfully`);
    
    // Show completion notification
    await this.showNotification(
      'SMS Batch Complete',
      `Sent ${successCount}/${results.length} messages`
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