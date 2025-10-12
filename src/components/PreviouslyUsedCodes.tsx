import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, History, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { VillaSubscriptionAPI } from "@/utils/villaSubscriptionApi";
import { toast } from "sonner";

interface UsedCode {
  code: string;
  duration?: number;
  used_at?: string;
  villa_count?: number;
  source: 'activation' | 'subscription';
}

export function PreviouslyUsedCodes() {
  const [codes, setCodes] = useState<UsedCode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPreviouslyUsedCodes();
  }, []);

  const loadPreviouslyUsedCodes = async () => {
    try {
      setLoading(true);
      const deviceId = await VillaSubscriptionAPI.getDeviceId();

      const { data, error } = await supabase
        .from('activation_codes')
        .select('code, duration, used_at, villa_count')
        .eq('used_by_device_id', deviceId)
        .eq('is_used', true)
        .order('used_at', { ascending: false });

      if (error) throw error;

      const activationList: UsedCode[] = (data || []).map((d) => ({
        code: d.code,
        duration: d.duration,
        used_at: d.used_at,
        villa_count: d.villa_count,
        source: 'activation',
      }));

      // Also load from current device's villa subscriptions as a fallback
      const subs = await VillaSubscriptionAPI.getVillaSubscriptions();
      const subList: UsedCode[] = subs.map((s) => ({
        code: s.activationCode,
        used_at: s.activatedAt?.toISOString?.() || undefined,
        villa_count: 1,
        source: 'subscription',
      }));

      setCodes([...activationList, ...subList]);
    } catch (error) {
      console.error('Error loading previously used codes:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Code ${code} copied!`);
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  if (codes.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Your Previously Used Codes</h3>
          </div>
          <Button onClick={loadPreviouslyUsedCodes} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          No codes found for this device. If you activated on another device (e.g., your phone), open the app there or paste the code here to reactivate.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Your Previously Used Codes</h3>
        </div>
        <Button 
          onClick={loadPreviouslyUsedCodes}
          variant="outline" 
          size="sm"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        These codes were previously used on this device. If you cleared your data, you can reactivate your villas using these codes (if still valid).
      </p>

      <div className="space-y-2">
        {codes.map((item, index) => (
          <div 
            key={index}
            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <code className="text-base font-mono font-bold">{item.code}</code>
                <Button
                  onClick={() => copyCode(item.code)}
                  variant="ghost"
                  size="sm"
                  className="h-7"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex gap-2 mt-1 flex-wrap">
                <Badge variant="outline" className="text-xs capitalize">{item.source}</Badge>
                {typeof item.duration === 'number' && (
                  <Badge variant="secondary" className="text-xs">{item.duration} days</Badge>
                )}
                {typeof item.villa_count === 'number' && (
                  <Badge variant="outline" className="text-xs">{item.villa_count} villa(s)</Badge>
                )}
                {item.used_at && (
                  <span className="text-xs text-muted-foreground">
                    Activated: {new Date(item.used_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <p className="text-sm text-blue-600 dark:text-blue-400">
          💡 Tip: Copy these codes and use them in the Villa Subscriptions section above to reactivate your villas.
        </p>
      </div>
    </Card>
  );
}