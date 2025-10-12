import { supabase } from '@/integrations/supabase/client';
import { Device } from '@capacitor/device';
import type { SubscriptionStatus } from '@/types';

export class SubscriptionAPI {
  /**
   * Get device ID using Capacitor Device plugin
   */
  static async getDeviceId(): Promise<string> {
    try {
      const info = await Device.getId();
      return info.identifier || `web-${Date.now()}-${Math.random()}`;
    } catch (error) {
      console.error('Error getting device ID:', error);
      return `fallback-${Date.now()}-${Math.random()}`;
    }
  }

  /**
   * Get IP fingerprint (basic implementation)
   */
  static async getIpFingerprint(): Promise<string | null> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip || null;
    } catch (error) {
      console.error('Error getting IP:', error);
      return null;
    }
  }

  /**
   * Check if device is eligible for free trial
   */
  static async checkTrialEligibility(): Promise<{ eligible: boolean; reason?: string }> {
    try {
      const deviceId = await this.getDeviceId();
      const ipFingerprint = await this.getIpFingerprint();

      const { data, error } = await supabase.functions.invoke('check-trial-eligibility', {
        body: { deviceId, ipFingerprint }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error checking trial eligibility:', error);
      return { eligible: false, reason: 'Error checking eligibility' };
    }
  }

  /**
   * Start free trial for current device
   */
  static async startFreeTrial(): Promise<{ success: boolean; subscription?: SubscriptionStatus; error?: string }> {
    try {
      const deviceId = await this.getDeviceId();
      const ipFingerprint = await this.getIpFingerprint();

      const { data, error } = await supabase.functions.invoke('start-free-trial', {
        body: { deviceId, ipFingerprint }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error starting trial:', error);
      return { success: false, error: error.message || 'Failed to start trial' };
    }
  }

  /**
   * Validate and activate an activation code
   */
  static async activateWithCode(code: string): Promise<{ success: boolean; subscription?: SubscriptionStatus; error?: string }> {
    try {
      const deviceId = await this.getDeviceId();

      const { data, error } = await supabase.functions.invoke('validate-activation-code', {
        body: { code: code.trim().toUpperCase(), deviceId }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error activating code:', error);
      return { success: false, error: error.message || 'Failed to activate code' };
    }
  }

  /**
   * Get current subscription status
   */
  static async getSubscriptionStatus(): Promise<SubscriptionStatus> {
    try {
      const deviceId = await this.getDeviceId();

      const { data, error } = await supabase.functions.invoke('get-subscription-status', {
        body: { deviceId }
      });

      if (error) throw error;
      
      return data.subscription || {
        isActive: false,
        type: 'trial',
        expiresAt: undefined,
        villaLimit: 1
      };
    } catch (error) {
      console.error('Error getting subscription status:', error);
      return {
        isActive: false,
        type: 'trial',
        expiresAt: undefined,
        villaLimit: 1
      };
    }
  }

  /**
   * Validate activation code format (client-side only)
   */
  static validateCodeFormat(code: string): boolean {
    const pattern = /^PK\d{6}[A-Z]{2}$/;
    return pattern.test(code);
  }
}
