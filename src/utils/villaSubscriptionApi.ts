import { supabase } from "@/integrations/supabase/client";
import { Device } from "@capacitor/device";
import type { VillaSubscription } from "@/types";

export class VillaSubscriptionAPI {
  static async getDeviceId(): Promise<string> {
    try {
      const info = await Device.getInfo();
      
      // Check if we're on web (browser preview)
      if (info.platform === 'web') {
        // Use a consistent device ID for web preview
        let webDeviceId = localStorage.getItem('web_device_id');
        if (!webDeviceId) {
          webDeviceId = `web-${Math.random().toString(36).substring(2, 15)}`;
          localStorage.setItem('web_device_id', webDeviceId);
        }
        return webDeviceId;
      }
      
      // For native platforms (iOS/Android)
      const deviceInfo = await Device.getId();
      return deviceInfo.identifier;
    } catch (error) {
      console.error('Error getting device ID:', error);
      // Fallback to a random ID
      let fallbackId = localStorage.getItem('fallback_device_id');
      if (!fallbackId) {
        fallbackId = `fallback-${Math.random().toString(36).substring(2, 15)}`;
        localStorage.setItem('fallback_device_id', fallbackId);
      }
      return fallbackId;
    }
  }

  static async getVillaSubscriptions(): Promise<VillaSubscription[]> {
    try {
      const deviceId = await this.getDeviceId();

      const { data, error } = await supabase
        .from('villa_subscriptions')
        .select('*')
        .eq('device_id', deviceId);

      if (error) {
        console.error('Error fetching villa subscriptions:', error);
        return [];
      }

      return (data || []).map(sub => ({
        id: sub.id,
        villaId: sub.villa_id,
        deviceId: sub.device_id,
        activationCode: sub.activation_code,
        isActive: sub.is_active,
        activatedAt: new Date(sub.activated_at),
        expiresAt: new Date(sub.expires_at),
        createdAt: new Date(sub.created_at),
      }));
    } catch (error) {
      console.error('Error in getVillaSubscriptions:', error);
      return [];
    }
  }
}
