import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Crown, Key, Calendar, CheckCircle } from 'lucide-react';
import { SubscriptionAPI } from '@/utils/subscriptionApi';
import { toast } from '@/hooks/use-toast';
import type { SubscriptionStatus } from '@/types';

interface SubscriptionCardProps {
  subscription: SubscriptionStatus;
  onUpdate: (status: SubscriptionStatus) => void;
  isRTL: boolean;
  language: 'en' | 'ar' | 'hi';
}

export function SubscriptionCard({ subscription, onUpdate, isRTL, language }: SubscriptionCardProps) {
  const [activationCode, setActivationCode] = useState('');
  const [isActivating, setIsActivating] = useState(false);

  const t = {
    en: {
      invalidFormat: "Invalid Code Format",
      formatDesc: "Code must be in format: PK######XX",
      success: "Success!",
      activationFailed: "Activation Failed",
      error: "Error",
      freeTrial: "Free Trial",
      premium: "Premium",
      villaAccess: "Villa Access",
      perVilla: "Per Villa",
      totalCapacity: "Total Capacity",
      vehicles: "vehicles",
      across: "across",
      villa: "villa",
      villas: "villas",
      activeCode: "Active Code",
      activationCode: "Activation Code",
      activate: "Activate",
      enterCode: "Enter your activation code",
      expired: "Expired",
      active: "Active",
      inactive: "Inactive",
      daysLeft: "days left",
      howItWorks: "How it Works:",
      eachCode: "Each code grants access to specific villas (1, 2, or more)",
      oneVilla: "1 Villa = 20 vehicles max",
      newCodes: "New codes extend your subscription time automatically",
      getCode: "Get Code",
      cars: "Cars"
    },
    ar: {
      invalidFormat: "تنسيق رمز غير صالح",
      formatDesc: "يجب أن يكون الرمز بتنسيق: PK######XX",
      success: "نجح!",
      activationFailed: "فشل التفعيل",
      error: "خطأ",
      freeTrial: "تجربة مجانية",
      premium: "بريميوم",
      villaAccess: "الوصول إلى الفيلا",
      perVilla: "لكل فيلا",
      totalCapacity: "السعة الإجمالية",
      vehicles: "مركبة",
      across: "عبر",
      villa: "فيلا",
      villas: "فيلات",
      activeCode: "الرمز النشط",
      activationCode: "رمز التفعيل",
      activate: "تفعيل",
      enterCode: "أدخل رمز التفعيل",
      expired: "منتهي",
      active: "نشط",
      inactive: "غير نشط",
      daysLeft: "أيام متبقية",
      howItWorks: "كيف يعمل:",
      eachCode: "كل رمز يمنح الوصول إلى عدد محدد من الفيلات",
      oneVilla: "1 فيلا = ٢٠ مركبة كحد أقصى",
      newCodes: "الرموز الجديدة تمدد وقت اشتراكك تلقائيًا",
      getCode: "احصل على رمز",
      cars: "مركبة"
    },
    hi: {
      invalidFormat: "अमान्य कोड प्रारूप",
      formatDesc: "कोड प्रारूप होना चाहिए: PK######XX",
      success: "सफलता!",
      activationFailed: "सक्रियण विफल",
      error: "त्रुटि",
      freeTrial: "मुफ्त परीक्षण",
      premium: "प्रीमियम",
      villaAccess: "विला एक्सेस",
      perVilla: "प्रति विला",
      totalCapacity: "कुल क्षमता",
      vehicles: "वाहन",
      across: "में",
      villa: "विला",
      villas: "विला",
      activeCode: "सक्रिय कोड",
      activationCode: "सक्रियण कोड",
      activate: "सक्रिय करें",
      enterCode: "अपना सक्रियण कोड दर्ज करें",
      expired: "समाप्त",
      active: "सक्रिय",
      inactive: "निष्क्रिय",
      daysLeft: "दिन शेष",
      howItWorks: "यह कैसे काम करता है:",
      eachCode: "प्रत्येक कोड विशिष्ट विला तक पहुंच प्रदान करता है",
      oneVilla: "1 विला = अधिकतम 20 वाहन",
      newCodes: "नए कोड आपकी सदस्यता समय को स्वचालित रूप से बढ़ाते हैं",
      getCode: "कोड प्राप्त करें",
      cars: "वाहन"
    }
  };

  const text = t[language];

  const handleActivation = async () => {
    if (!activationCode.trim()) return;
    
    // Validate format first
    if (!SubscriptionAPI.validateCodeFormat(activationCode.trim())) {
      toast({
        title: text.invalidFormat,
        description: text.formatDesc,
        variant: "destructive"
      });
      return;
    }
    
    setIsActivating(true);
    
    try {
      const result = await SubscriptionAPI.activateWithCode(activationCode.trim());
      
      if (result.success && result.subscription) {
        onUpdate(result.subscription);
        setActivationCode('');
        
        const message = result.message || "Subscription activated successfully!";
        toast({
          title: text.success,
          description: message,
        });
      } else {
        toast({
          title: text.activationFailed,
          description: result.error || "Invalid activation code",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: text.error,
        description: "Failed to activate code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsActivating(false);
    }
  };

  const isExpired = subscription.expiresAt && new Date() > new Date(subscription.expiresAt);
  const daysLeft = subscription.expiresAt 
    ? Math.max(0, Math.ceil((new Date(subscription.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <Card className={`card-mobile ${isRTL ? 'text-right' : 'text-left'}`}>
      <div className="space-y-4">
        {/* Subscription Status */}
        <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Crown className="h-6 w-6 text-primary" />
            <div>
              <h3 className="font-semibold">
                {subscription.type === 'trial' && text.freeTrial}
                {subscription.type === 'activation_code' && text.premium}
                {subscription.type === 'google_play' && text.premium}
              </h3>
              <p className="text-sm text-muted-foreground">
                {subscription.villaLimit && `${subscription.villaLimit} ${subscription.villaLimit === 1 ? text.villa : text.villas} × 20 ${text.vehicles}`}
              </p>
            </div>
          </div>
          
          <Badge variant={isExpired ? 'destructive' : subscription.isActive ? 'success' : 'secondary'}>
            {isExpired ? text.expired : subscription.isActive ? text.active : text.inactive}
          </Badge>
        </div>
        
        {/* Expiry Info */}
        {subscription.expiresAt && (
          <div className={`flex items-center gap-2 p-3 rounded-lg bg-muted/50 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div className="text-sm">
              {isExpired ? (
                <span>{text.expired}</span>
              ) : (
                <span className="font-medium">{daysLeft} {text.daysLeft}</span>
              )}
            </div>
          </div>
        )}
        
        {/* Activation Code Input */}
        {(!subscription.isActive || isExpired) && (
          <div className="space-y-3">
            <Label htmlFor="activationCode" className="flex items-center gap-2 text-sm font-medium">
              <Key className="h-4 w-4" />
              {text.activationCode}
            </Label>
            <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Input
                id="activationCode"
                value={activationCode}
                onChange={(e) => setActivationCode(e.target.value.toUpperCase())}
                placeholder="PK123456AB"
                className="font-mono"
                dir="ltr"
              />
              <Button
                onClick={handleActivation}
                disabled={!activationCode.trim() || isActivating}
                variant="success"
                size="sm"
              >
                {isActivating ? (
                  <>⏳</>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    {text.activate}
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {text.enterCode}
            </p>
          </div>
        )}
        
        {/* Subscription Details Card */}
        {subscription.isActive && !isExpired && (
          <div className="space-y-3 p-4 bg-success/5 rounded-lg border border-success/20">
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                {text.activeCode}
              </Label>
              {subscription.activationCode && (
                <div className="p-3 bg-background rounded-lg border">
                  <code className="text-sm font-mono text-success">
                    {subscription.activationCode}
                  </code>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-background rounded-lg border">
                <p className="text-xs text-muted-foreground mb-1">
                  {text.villaAccess}
                </p>
                <p className="text-lg font-semibold">
                  {subscription.villaLimit || 1} {subscription.villaLimit === 1 ? text.villa : text.villas}
                </p>
              </div>
              <div className="p-3 bg-background rounded-lg border">
                <p className="text-xs text-muted-foreground mb-1">
                  {text.perVilla}
                </p>
                <p className="text-lg font-semibold">20 {text.cars}</p>
              </div>
            </div>
            
            <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
              <p className="text-xs text-muted-foreground mb-1">
                {text.totalCapacity}
              </p>
              <p className="text-sm font-medium">
                {(subscription.villaLimit || 1) * 20} {text.vehicles} {text.across} {subscription.villaLimit || 1} {subscription.villaLimit === 1 ? text.villa : text.villas}
              </p>
            </div>
          </div>
        )}
        
        {/* Info Box - How it works */}
        {(!subscription.isActive || isExpired) && (
          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <p className="text-sm font-medium">
              {text.howItWorks}
            </p>
            <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-inside">
              <li>{text.eachCode}</li>
              <li>{text.oneVilla}</li>
              <li>{text.newCodes}</li>
            </ul>
          </div>
        )}
        
        {/* Actions */}
        <div className={`flex gap-2 pt-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {subscription.type !== 'google_play' && (
            <Button variant="outline" size="sm" className="flex-1">
              {text.getCode}
            </Button>
          )}
          <Button variant="mobile" size="sm" className="flex-1">
            Google Play
          </Button>
        </div>
      </div>
    </Card>
  );
}