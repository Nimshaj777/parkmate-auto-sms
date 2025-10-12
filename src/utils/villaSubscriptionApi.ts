import { supabase } from "@/integrations/supabase/client";
import { Device } from "@capacitor/device";
import type { VillaSubscription } from "@/types";

export class VillaSubscriptionAPI {
  static async getVillaSubscriptions(): Promise<VillaSubscription[]> {
    try {
      const deviceInfo = await Device.getId();
      const deviceId = deviceInfo.identifier;

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
