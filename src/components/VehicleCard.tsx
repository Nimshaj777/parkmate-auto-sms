import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Edit3, Check, X, MessageSquare } from 'lucide-react';
import type { Vehicle } from '@/types';

interface VehicleCardProps {
  vehicle: Vehicle;
  onUpdate: (id: string, updates: Partial<Vehicle>) => void;
  onDelete: (id: string) => void;
  isRTL: boolean;
}

export function VehicleCard({ vehicle, onUpdate, onDelete, isRTL }: VehicleCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [plateNumber, setPlateNumber] = useState(vehicle.plateNumber);
  const [smsMessage, setSmsMessage] = useState(vehicle.smsMessage);

  const handleSave = () => {
    onUpdate(vehicle.id, {
      plateNumber,
      smsMessage,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setPlateNumber(vehicle.plateNumber);
    setSmsMessage(vehicle.smsMessage);
    setIsEditing(false);
  };

  const getStatusVariant = (status: Vehicle['status']) => {
    switch (status) {
      case 'sent': return 'default';
      case 'verified': return 'success';
      case 'failed': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: Vehicle['status']) => {
    switch (status) {
      case 'sent': return '📤';
      case 'verified': return '✅';
      case 'failed': return '❌';
      default: return '⏳';
    }
  };

  return (
    <Card className={`card-mobile ${isRTL ? 'text-right' : 'text-left'}`}>
      <div className="space-y-4">
        {isEditing ? (
          <>
            <div className="space-y-2">
              <Label htmlFor={`plate-${vehicle.id}`} className="text-sm font-medium">
                Plate Number / رقم اللوحة
              </Label>
              <Input
                id={`plate-${vehicle.id}`}
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value)}
                placeholder="AUH14 47402"
                className="text-center font-mono text-lg"
                dir="ltr"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor={`sms-${vehicle.id}`} className="text-sm font-medium">
                SMS Message / رسالة SMS
              </Label>
              <Input
                id={`sms-${vehicle.id}`}
                value={smsMessage}
                onChange={(e) => setSmsMessage(e.target.value)}
                placeholder="AUH14 47402 E21 6"
                className="font-mono"
                dir="ltr"
              />
            </div>
            
            <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Button onClick={handleSave} size="sm" variant="success" className="flex-1">
                <Check className="h-4 w-4" />
                Save / حفظ
              </Button>
              <Button onClick={handleCancel} size="sm" variant="outline" className="flex-1">
                <X className="h-4 w-4" />
                Cancel / إلغاء
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="space-y-1">
                <div className="text-lg font-bold font-mono tracking-wider text-primary ltr">
                  {vehicle.plateNumber}
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  <span className="font-mono ltr">{vehicle.smsMessage}</span>
                </div>
              </div>
              
              <div className="flex flex-col items-center gap-2">
                <Badge variant={getStatusVariant(vehicle.status)} className="text-xs">
                  <span className="mr-1">{getStatusIcon(vehicle.status)}</span>
                  {vehicle.status.toUpperCase()}
                </Badge>
                {vehicle.lastSent && (
                  <div className="text-xs text-muted-foreground">
                    {new Date(vehicle.lastSent).toLocaleTimeString(isRTL ? 'ar' : 'en')}
                  </div>
                )}
              </div>
            </div>
            
            <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {(vehicle.status === 'pending' || vehicle.status === 'failed') && (
                <Button
                  onClick={() => onUpdate(vehicle.id, { status: 'sent', lastSent: new Date() })}
                  size="sm"
                  variant="default"
                  className="flex-1"
                >
                  <MessageSquare className="h-4 w-4" />
                  Send / إرسال
                </Button>
              )}
              <Button
                onClick={() => setIsEditing(true)}
                size="sm"
                variant="outline"
                className={vehicle.status === 'pending' || vehicle.status === 'failed' ? '' : 'flex-1'}
              >
                <Edit3 className="h-4 w-4" />
                Edit / تعديل
              </Button>
              <Button
                onClick={() => onDelete(vehicle.id)}
                size="sm"
                variant="destructive"
                className={vehicle.status === 'pending' || vehicle.status === 'failed' ? '' : 'flex-1'}
              >
                <Trash2 className="h-4 w-4" />
                Delete / حذف
              </Button>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}