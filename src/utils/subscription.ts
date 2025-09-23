import { Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';
import { LocalStorage } from './storage';
import type { SubscriptionStatus } from '@/types';

export interface ActivationCode {
  id: string;
  code: string;
  duration: number; // in days (30, 60, 90)
  isUsed: boolean;
  usedBy?: string; // device identifier
  usedAt?: Date;
  createdAt: Date;
}

export interface DeviceInfo {
  deviceId: string;
  ipAddress?: string;
  hasUsedTrial: boolean;
  firstTrialAt?: Date;
  createdAt: Date;
}

export class SubscriptionManager {
  // Generate activation code for manual distribution
  static generateActivationCode(duration: number = 30): string {
    const prefix = 'PK';
    const numbers = Math.floor(100000 + Math.random() * 900000).toString();
    const letters = String.fromCharCode(65 + Math.floor(Math.random() * 26)) + 
                   String.fromCharCode(65 + Math.floor(Math.random() * 26));
    
    return `${prefix}${numbers}${letters}`;
  }

  // Validate activation code format
  static validateCodeFormat(code: string): boolean {
    const codeRegex = /^PK\d{6}[A-Z]{2}$/;
    return codeRegex.test(code);
  }

  // Get device identifier
  static async getDeviceId(): Promise<string> {
    try {
      const deviceInfo = await Device.getId();
      return deviceInfo.identifier || 'web-unknown';
    } catch (error) {
      // Fallback for web or if device info fails
      let webDeviceId = localStorage.getItem('web-device-id');
      if (!webDeviceId) {
        webDeviceId = 'web-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('web-device-id', webDeviceId);
      }
      return webDeviceId;
    }
  }

  // Check if device has used trial (IP-based tracking for web)
  static async hasUsedTrial(): Promise<boolean> {
    try {
      const deviceId = await this.getDeviceId();
      const trialDevices = await LocalStorage.getTrialDevices();
      
      // Check if current device has used trial
      const deviceUsedTrial = trialDevices.some(device => 
        device.deviceId === deviceId && device.hasUsedTrial
      );

      if (deviceUsedTrial) {
        return true;
      }

      // For web platform, also check IP-based tracking
      if (Capacitor.getPlatform() === 'web') {
        return await this.checkIPTrialUsage();
      }

      return false;
    } catch (error) {
      console.error('Error checking trial usage:', error);
      return false;
    }
  }

  // IP-based trial tracking for web
  private static async checkIPTrialUsage(): Promise<boolean> {
    try {
      // Get approximate IP info (this is a simplified version)
      // In production, you'd want to use a more robust IP detection service
      const ipInfo = await this.getIPInfo();
      const trialIPs = await LocalStorage.getTrialIPs();
      
      return trialIPs.includes(ipInfo.ip);
    } catch (error) {
      console.error('Error checking IP trial usage:', error);
      return false;
    }
  }

  // Get IP information (simplified version)
  private static async getIPInfo(): Promise<{ ip: string }> {
    try {
      // This is a placeholder - in production you'd use a real IP service
      // For now, we'll use a combination of browser fingerprinting
      const fingerprint = await this.getBrowserFingerprint();
      return { ip: fingerprint };
    } catch (error) {
      return { ip: 'unknown' };
    }
  }

  // Browser fingerprinting for web trial tracking
  private static async getBrowserFingerprint(): Promise<string> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Browser fingerprint', 2, 2);
    }
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|');
    
    // Create a simple hash
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return 'fp-' + Math.abs(hash).toString(36);
  }

  // Start free trial
  static async startFreeTrial(): Promise<SubscriptionStatus> {
    const deviceId = await this.getDeviceId();
    const hasUsed = await this.hasUsedTrial();
    
    if (hasUsed) {
      throw new Error('Free trial already used on this device/network');
    }

    // Mark device as having used trial
    await this.markTrialAsUsed(deviceId);
    
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 3); // 3 day trial

    return {
      isActive: true,
      type: 'trial',
      expiresAt: trialEnd
    };
  }

  // Mark trial as used
  private static async markTrialAsUsed(deviceId: string): Promise<void> {
    const trialDevices = await LocalStorage.getTrialDevices();
    
    // Add device to trial list
    trialDevices.push({
      deviceId,
      hasUsedTrial: true,
      firstTrialAt: new Date(),
      createdAt: new Date()
    });

    await LocalStorage.saveTrialDevices(trialDevices);

    // For web, also mark IP as used
    if (Capacitor.getPlatform() === 'web') {
      const ipInfo = await this.getIPInfo();
      const trialIPs = await LocalStorage.getTrialIPs();
      if (!trialIPs.includes(ipInfo.ip)) {
        trialIPs.push(ipInfo.ip);
        await LocalStorage.saveTrialIPs(trialIPs);
      }
    }
  }

  // Activate with code
  static async activateWithCode(code: string): Promise<SubscriptionStatus> {
    if (!this.validateCodeFormat(code)) {
      throw new Error('Invalid activation code format');
    }

    // In a real implementation, you'd validate against your server
    // For now, we'll simulate validation
    const isValid = await this.validateActivationCode(code);
    
    if (!isValid) {
      throw new Error('Invalid or expired activation code');
    }

    // Determine subscription duration based on stored codes
    const storedCodes = await LocalStorage.getActivationCodes();
    const codeInfo = storedCodes.find(c => c.code === code && !c.isUsed);
    
    if (!codeInfo) {
      throw new Error('Activation code not found or already used');
    }

    // Mark code as used
    codeInfo.isUsed = true;
    codeInfo.usedBy = await this.getDeviceId();
    codeInfo.usedAt = new Date();
    
    await LocalStorage.saveActivationCodes(storedCodes);

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + codeInfo.duration);

    return {
      isActive: true,
      type: 'activation_code',
      expiresAt: expiryDate,
      activationCode: code
    };
  }

  // Validate activation code (simulate server validation)
  private static async validateActivationCode(code: string): Promise<boolean> {
    const storedCodes = await LocalStorage.getActivationCodes();
    return storedCodes.some(c => c.code === code && !c.isUsed);
  }

  // Generate and store activation codes (for your manual distribution)
  static async generateAndStoreCode(duration: number = 30): Promise<string> {
    const code = this.generateActivationCode(duration);
    const storedCodes = await LocalStorage.getActivationCodes();
    
    const newCode: ActivationCode = {
      id: Date.now().toString(),
      code,
      duration,
      isUsed: false,
      createdAt: new Date()
    };
    
    storedCodes.push(newCode);
    await LocalStorage.saveActivationCodes(storedCodes);
    
    return code;
  }

  // Get all generated codes (for your reference)
  static async getAllCodes(): Promise<ActivationCode[]> {
    return await LocalStorage.getActivationCodes();
  }

  // Check subscription status
  static async checkSubscriptionStatus(): Promise<SubscriptionStatus> {
    const currentStatus = await LocalStorage.getSubscriptionStatus();
    
    // Check if subscription has expired
    if (currentStatus.expiresAt && new Date() > new Date(currentStatus.expiresAt)) {
      const expiredStatus: SubscriptionStatus = {
        ...currentStatus,
        isActive: false
      };
      await LocalStorage.saveSubscriptionStatus(expiredStatus);
      return expiredStatus;
    }
    
    return currentStatus;
  }
}