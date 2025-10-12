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
}

export function SubscriptionCard({ subscription, onUpdate, isRTL }: SubscriptionCardProps) {
  const [activationCode, setActivationCode] = useState('');
  const [isActivating, setIsActivating] = useState(false);

  const handleActivation = async () => {
    if (!activationCode.trim()) return;
    
    // Validate format first
    if (!SubscriptionAPI.validateCodeFormat(activationCode.trim())) {
      toast({
        title: "Invalid Code Format / تنسيق رمز غير صالح / अमान्य कोड प्रारूप",
        description: "Code must be in format: PK######XX",
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
          title: "Success! / نجح! / सफलता!",
          description: message,
        });
      } else {
        toast({
          title: "Activation Failed / فشل التفعيل / सक्रियण विफल",
          description: result.error || "Invalid activation code",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error / خطأ / त्रुटि",
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
                {subscription.type === 'trial' && 'Free Trial / تجربة مجانية / मुफ्त परीक्षण'}
                {subscription.type === 'activation_code' && 'Premium / بريميوم / प्रीमियम'}
                {subscription.type === 'google_play' && 'Premium / بريميوم / प्रीमियम'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {subscription.villaLimit && `${subscription.villaLimit} ${subscription.villaLimit === 1 ? 'Villa' : 'Villas'} × 20 vehicles`}
              </p>
              <p className="text-xs text-muted-foreground">
                {subscription.villaLimit && `${subscription.villaLimit} فيلا × ٢٠ مركبة | ${subscription.villaLimit} विला × २० वाहन`}
              </p>
            </div>
          </div>
          
          <Badge variant={isExpired ? 'destructive' : subscription.isActive ? 'success' : 'secondary'}>
            {isExpired ? 'Expired / منتهي / समाप्त' : subscription.isActive ? 'Active / نشط / सक्रिय' : 'Inactive / غير نشط / निष्क्रिय'}
          </Badge>
        </div>
        
        {/* Expiry Info */}
        {subscription.expiresAt && (
          <div className={`flex items-center gap-2 p-3 rounded-lg bg-muted/50 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div className="text-sm">
              {isExpired ? (
                <span>Expired / انتهت الصلاحية / समाप्त हो गया</span>
              ) : (
                <>
                  <span className="font-medium">{daysLeft} days left</span>
                  <span className="text-muted-foreground"> | {daysLeft} أيام متبقية | {daysLeft} दिन शेष</span>
                </>
              )}
            </div>
          </div>
        )}
        
        {/* Activation Code Input */}
        {(!subscription.isActive || isExpired) && (
          <div className="space-y-3">
            <Label htmlFor="activationCode" className="flex items-center gap-2 text-sm font-medium">
              <Key className="h-4 w-4" />
              Activation Code / رمز التفعيل / सक्रियण कोड
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
                    Activate / تفعيل / सक्रिय करें
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Enter your activation code / أدخل رمز التفعيل / अपना सक्रियण कोड दर्ज करें
            </p>
          </div>
        )}
        
        {/* Subscription Details Card */}
        {subscription.isActive && !isExpired && (
          <div className="space-y-3 p-4 bg-success/5 rounded-lg border border-success/20">
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Active Code / الرمز النشط / सक्रिय कोड
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
                  Villa Access / الوصول إلى الفيلا / विला एक्सेस
                </p>
                <p className="text-lg font-semibold">
                  {subscription.villaLimit || 1} {subscription.villaLimit === 1 ? 'Villa' : 'Villas'}
                </p>
              </div>
              <div className="p-3 bg-background rounded-lg border">
                <p className="text-xs text-muted-foreground mb-1">
                  Per Villa / لكل فيلا / प्रति विला
                </p>
                <p className="text-lg font-semibold">20 Cars / مركبة / वाहन</p>
              </div>
            </div>
            
            <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
              <p className="text-xs text-muted-foreground mb-1">
                Total Capacity / السعة الإجمالية / कुल क्षमता
              </p>
              <p className="text-sm font-medium">
                {(subscription.villaLimit || 1) * 20} vehicles across {subscription.villaLimit || 1} {subscription.villaLimit === 1 ? 'villa' : 'villas'}
              </p>
            </div>
          </div>
        )}
        
        {/* Info Box - How it works */}
        {(!subscription.isActive || isExpired) && (
          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <p className="text-sm font-medium">
              How it Works / كيف يعمل / यह कैसे काम करता है:
            </p>
            <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-inside">
              <li>Each code grants access to specific villas (1, 2, or more)</li>
              <li>كل رمز يمنح الوصول إلى عدد محدد من الفيلات</li>
              <li>प्रत्येक कोड विशिष्ट विला तक पहुंच प्रदान करता है</li>
              <li className="pt-1">1 Villa = 20 vehicles max | 1 فيلا = ٢٠ مركبة كحد أقصى | 1 विला = अधिकतम 20 वाहन</li>
              <li className="pt-1">New codes extend your subscription time automatically</li>
              <li>الرموز الجديدة تمدد وقت اشتراكك تلقائيًا</li>
              <li>नए कोड आपकी सदस्यता समय को स्वचालित रूप से बढ़ाते हैं</li>
            </ul>
          </div>
        )}
        
        {/* Actions */}
        <div className={`flex gap-2 pt-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {subscription.type !== 'google_play' && (
            <Button variant="outline" size="sm" className="flex-1">
              Get Code / احصل على رمز / कोड प्राप्त करें
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