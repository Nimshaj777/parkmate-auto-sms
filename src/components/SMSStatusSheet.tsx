import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Clock, Send } from 'lucide-react';
import type { Vehicle, SMSStatus } from '@/types';

interface SMSStatusSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicles: Vehicle[];
  onStatusUpdate: (vehicleId: string, status: Vehicle['status']) => void;
  isRTL: boolean;
}

export function SMSStatusSheet({ 
  open, 
  onOpenChange, 
  vehicles, 
  onStatusUpdate,
  isRTL 
}: SMSStatusSheetProps) {
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentVehicle, setCurrentVehicle] = useState<string | null>(null);
  const [results, setResults] = useState<SMSStatus[]>([]);

  const startSending = async () => {
    setSending(true);
    setProgress(0);
    setResults([]);
    
    const vehiclesToSend = vehicles.filter(v => v.status !== 'sent');
    const totalVehicles = vehiclesToSend.length;
    
    if (totalVehicles === 0) {
      setSending(false);
      return;
    }

    // Send all SMS in parallel
    const sendPromises = vehiclesToSend.map(async (vehicle, index) => {
      setCurrentVehicle(`${index + 1}/${totalVehicles}`);
      
      // Simulate SMS sending with random delay (between 1-2 seconds)
      const delay = 1000 + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      const success = Math.random() > 0.15; // 85% success rate
      const status: Vehicle['status'] = success ? 'sent' : 'failed';
      
      onStatusUpdate(vehicle.id, status);
      
      const result: SMSStatus = {
        vehicleId: vehicle.id,
        status,
        sentAt: new Date(),
        message: success ? 'SMS sent successfully' : 'Failed to send SMS'
      };
      
      setResults(prev => [...prev, result]);
      
      // Update progress incrementally as each SMS completes
      setProgress(prevProgress => Math.min(100, prevProgress + (100 / totalVehicles)));
      
      return result;
    });

    // Wait for all SMS to complete
    await Promise.all(sendPromises);
    
    setSending(false);
    setCurrentVehicle(null);
    setProgress(100);
  };

  const getStatusIcon = (status: Vehicle['status']) => {
    switch (status) {
      case 'sent': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'failed': return <XCircle className="h-4 w-4 text-error" />;
      case 'verified': return <CheckCircle className="h-4 w-4 text-success" />;
      default: return <Clock className="h-4 w-4 text-warning" />;
    }
  };

  const pendingCount = vehicles.filter(v => v.status === 'pending' || v.status === 'failed').length;
  const sentCount = vehicles.filter(v => v.status === 'sent' || v.status === 'verified').length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side={isRTL ? 'left' : 'right'} 
        className={`mobile-container w-full max-w-md ${isRTL ? 'text-right' : 'text-left'}`}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-xl">
            <Send className="h-6 w-6 text-primary" />
            SMS Status / حالة الرسائل
          </SheetTitle>
        </SheetHeader>
        
        <div className="space-y-6 pt-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="card-mobile text-center">
              <div className="text-2xl font-bold text-success">{sentCount}</div>
              <div className="text-sm text-muted-foreground">Sent / مرسل</div>
            </div>
            <div className="card-mobile text-center">
              <div className="text-2xl font-bold text-warning">{pendingCount}</div>
              <div className="text-sm text-muted-foreground">Pending / في الانتظار</div>
            </div>
          </div>
          
          {/* Send All Button */}
          {!sending && pendingCount > 0 && (
            <Button
              onClick={startSending}
              variant="mobile"
              size="mobile"
              className="w-full"
              disabled={vehicles.length === 0}
            >
              <Send className="h-5 w-5" />
              Send All SMS ({pendingCount}) / إرسال جميع الرسائل
            </Button>
          )}
          
          {/* Progress */}
          {sending && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Sending SMS... / جاري الإرسال...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-muted-foreground text-center">
                Sending to all {vehicles.filter(v => v.status !== 'sent').length} vehicles together / إرسال إلى جميع المركبات معًا
              </p>
            </div>
          )}
          
          {/* Vehicle Status List */}
          <div className="space-y-3">
            <h3 className="font-medium">Vehicle Status / حالة المركبات</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {vehicles.map(vehicle => (
                <div
                  key={vehicle.id}
                  className={`flex items-center justify-between p-3 rounded-lg border bg-card ${
                    isRTL ? 'flex-row-reverse' : ''
                  }`}
                >
                  <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    {getStatusIcon(vehicle.status)}
                    <div>
                      <div className="font-mono text-sm font-medium ltr">
                        {vehicle.plateNumber}
                      </div>
                      {vehicle.lastSent && (
                        <div className="text-xs text-muted-foreground">
                          {new Date(vehicle.lastSent).toLocaleTimeString(isRTL ? 'ar' : 'en')}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Badge 
                    variant={
                      vehicle.status === 'sent' || vehicle.status === 'verified' 
                        ? 'default' 
                        : vehicle.status === 'failed' 
                        ? 'destructive' 
                        : 'secondary'
                    }
                    className="text-xs"
                  >
                    {vehicle.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}