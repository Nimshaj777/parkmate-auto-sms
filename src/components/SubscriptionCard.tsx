import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Crown, Key, Calendar, CheckCircle } from 'lucide-react';
import { SMSService } from '@/utils/sms';
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
    
    setIsActivating(true);
    
    // Simulate activation process
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (SMSService.validateActivationCode(activationCode.trim())) {
      const newStatus: SubscriptionStatus = {
        isActive: true,
        type: 'activation_code',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        activationCode: activationCode.trim()
      };
      
      onUpdate(newStatus);
      setActivationCode('');
    } else {
      alert('Invalid activation code. Please check and try again.');
    }
    
    setIsActivating(false);
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
                {subscription.type === 'trial' && 'Free Trial / تجربة مجانية'}
                {subscription.type === 'activation_code' && 'Premium / بريميوم'}
                {subscription.type === 'google_play' && 'Premium / بريميوم'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {subscription.type === 'trial' && '7-day free trial / تجربة مجانية لمدة 7 أيام'}
                {subscription.type === 'activation_code' && 'Activated with code / مُفعّل برمز'}
                {subscription.type === 'google_play' && 'Google Play subscription / اشتراك جوجل بلاي'}
              </p>
            </div>
          </div>
          
          <Badge variant={isExpired ? 'destructive' : subscription.isActive ? 'success' : 'secondary'}>
            {isExpired ? 'Expired / منتهي' : subscription.isActive ? 'Active / نشط' : 'Inactive / غير نشط'}
          </Badge>
        </div>
        
        {/* Expiry Info */}
        {subscription.expiresAt && (
          <div className={`flex items-center gap-2 p-3 rounded-lg bg-muted/50 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {isExpired 
                ? 'Expired / انتهت الصلاحية' 
                : `${daysLeft} days left / ${daysLeft} أيام متبقية`
              }
            </span>
          </div>
        )}
        
        {/* Activation Code Input */}
        {(!subscription.isActive || isExpired) && (
          <div className="space-y-3">
            <Label htmlFor="activationCode" className="flex items-center gap-2 text-sm font-medium">
              <Key className="h-4 w-4" />
              Activation Code / رمز التفعيل
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
                    Activate / تفعيل
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Enter your monthly activation code / أدخل رمز التفعيل الشهري
            </p>
          </div>
        )}
        
        {/* Current Code Display */}
        {subscription.isActive && subscription.activationCode && !isExpired && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Current Code / الرمز الحالي</Label>
            <div className="p-3 bg-success/10 rounded-lg border border-success/20">
              <code className="text-sm font-mono text-success ltr">
                {subscription.activationCode}
              </code>
            </div>
          </div>
        )}
        
        {/* Actions */}
        <div className={`flex gap-2 pt-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {subscription.type !== 'google_play' && (
            <Button variant="outline" size="sm" className="flex-1">
              Get Code / احصل على رمز
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