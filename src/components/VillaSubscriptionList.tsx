import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Check, Lock, Calendar, Home } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Device } from "@capacitor/device";
import type { Villa, VillaSubscription } from "@/types";

interface VillaSubscriptionListProps {
  villas: Villa[];
  villaSubscriptions: VillaSubscription[];
  onUpdate: () => void;
  language: 'en' | 'ar' | 'hi';
  direction: 'ltr' | 'rtl';
}

export function VillaSubscriptionList({
  villas,
  villaSubscriptions,
  onUpdate,
  language,
  direction,
}: VillaSubscriptionListProps) {
  const [activationCodes, setActivationCodes] = useState<Record<string, string>>({});
  const [activatingVillas, setActivatingVillas] = useState<Record<string, boolean>>({});

  const t = {
    en: {
      villaSubscriptions: "Villa Subscriptions",
      activationCode: "Activation Code",
      activate: "Activate",
      active: "Active",
      inactive: "Inactive",
      expires: "Expires",
      enterCode: "Enter activation code for",
      activating: "Activating...",
      activated: "Villa activated successfully!",
      error: "Failed to activate villa",
      alreadyActive: "This villa is already active",
    },
    ar: {
      villaSubscriptions: "اشتراكات الفيلا",
      activationCode: "كود التفعيل",
      activate: "تفعيل",
      active: "نشط",
      inactive: "غير نشط",
      expires: "تنتهي في",
      enterCode: "أدخل كود التفعيل لـ",
      activating: "جاري التفعيل...",
      activated: "تم تفعيل الفيلا بنجاح!",
      error: "فشل تفعيل الفيلا",
      alreadyActive: "هذه الفيلا مفعلة بالفعل",
    },
    hi: {
      villaSubscriptions: "विला सदस्यता",
      activationCode: "सक्रियण कोड",
      activate: "सक्रिय करें",
      active: "सक्रिय",
      inactive: "निष्क्रिय",
      expires: "समाप्ति",
      enterCode: "के लिए सक्रियण कोड दर्ज करें",
      activating: "सक्रिय हो रहा है...",
      activated: "विला सफलतापूर्वक सक्रिय हो गया!",
      error: "विला सक्रिय करने में विफल",
      alreadyActive: "यह विला पहले से सक्रिय है",
    },
  };

  const text = t[language];

  const getVillaSubscription = (villaId: string): VillaSubscription | undefined => {
    return villaSubscriptions.find(
      (sub) => sub.villaId === villaId && sub.isActive && new Date(sub.expiresAt) > new Date()
    );
  };

  const handleActivate = async (villa: Villa) => {
    const code = activationCodes[villa.id]?.trim();
    if (!code) {
      toast.error(text.error);
      return;
    }

    setActivatingVillas((prev) => ({ ...prev, [villa.id]: true }));

    try {
      const deviceInfo = await Device.getId();
      const deviceId = deviceInfo.identifier;

      const { data, error } = await supabase.functions.invoke('activate-villa-subscription', {
        body: {
          code,
          deviceId,
          villaId: villa.id,
        },
      });

      if (error) throw error;

      if (data?.success) {
        toast.success(text.activated);
        setActivationCodes((prev) => ({ ...prev, [villa.id]: '' }));
        onUpdate();
      } else {
        toast.error(data?.error || text.error);
      }
    } catch (error) {
      console.error('Error activating villa:', error);
      toast.error(text.error);
    } finally {
      setActivatingVillas((prev) => ({ ...prev, [villa.id]: false }));
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Crown className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">{text.villaSubscriptions}</h3>
      </div>

      {villas.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Home className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">
            {language === 'en' && 'No villas added yet. Go to the Villas tab to add your first villa.'}
            {language === 'ar' && 'لم يتم إضافة فيلات بعد. انتقل إلى علامة تبويب الفيلات لإضافة أول فيلا.'}
            {language === 'hi' && 'अभी तक कोई विला नहीं जोड़ा गया। अपना पहला विला जोड़ने के लिए विला टैब पर जाएं।'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
        {villas.map((villa) => {
          const subscription = getVillaSubscription(villa.id);
          const isActive = !!subscription;
          const isActivating = activatingVillas[villa.id];

          return (
            <div
              key={villa.id}
              className="border rounded-lg p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{villa.name}</span>
                  {isActive ? (
                    <Badge variant="default" className="gap-1">
                      <Check className="h-3 w-3" />
                      {text.active}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="gap-1">
                      <Lock className="h-3 w-3" />
                      {text.inactive}
                    </Badge>
                  )}
                </div>
                {subscription && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {text.expires}: {new Date(subscription.expiresAt).toLocaleDateString()}
                  </div>
                )}
              </div>

              <div className="flex gap-2" dir={direction}>
                <Input
                  placeholder={`${text.enterCode} ${villa.name}`}
                  value={activationCodes[villa.id] || ''}
                  onChange={(e) =>
                    setActivationCodes((prev) => ({
                      ...prev,
                      [villa.id]: e.target.value.toUpperCase(),
                    }))
                  }
                  className="flex-1"
                  maxLength={10}
                  disabled={isActive}
                />
                <Button
                  onClick={() => handleActivate(villa)}
                  disabled={isActive || !activationCodes[villa.id] || isActivating}
                  className="gap-2"
                >
                  {isActivating ? (
                    <>{text.activating}</>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      {text.activate}
                    </>
                  )}
                </Button>
              </div>
            </div>
          );
        })}
        </div>
      )}
    </Card>
  );
}
