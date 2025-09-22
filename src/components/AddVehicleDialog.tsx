import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Car } from 'lucide-react';
import type { Vehicle } from '@/types';

interface AddVehicleDialogProps {
  onAdd: (vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => void;
  isRTL: boolean;
}

export function AddVehicleDialog({ onAdd, isRTL }: AddVehicleDialogProps) {
  const [open, setOpen] = useState(false);
  const [plateNumber, setPlateNumber] = useState('');
  const [smsMessage, setSmsMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!plateNumber.trim() || !smsMessage.trim()) return;
    
    onAdd({
      plateNumber: plateNumber.trim(),
      smsMessage: smsMessage.trim(),
      status: 'pending'
    });
    
    // Reset form
    setPlateNumber('');
    setSmsMessage('');
    setOpen(false);
  };

  // Auto-generate SMS message when plate number changes
  const handlePlateChange = (value: string) => {
    setPlateNumber(value);
    // Auto-format common UAE patterns
    if (value && !smsMessage) {
      setSmsMessage(`${value} E21 6`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="mobile" size="mobile" className="w-full">
          <Plus className="h-5 w-5" />
          Add Vehicle / إضافة مركبة
        </Button>
      </DialogTrigger>
      
      <DialogContent className={`mobile-container ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Car className="h-6 w-6 text-primary" />
            Add New Vehicle / إضافة مركبة جديدة
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="plateNumber" className="text-sm font-medium">
              Plate Number / رقم اللوحة
            </Label>
            <Input
              id="plateNumber"
              value={plateNumber}
              onChange={(e) => handlePlateChange(e.target.value.toUpperCase())}
              placeholder="AUH14 47402"
              className="text-center font-mono text-lg h-12"
              dir="ltr"
              required
            />
            <p className="text-xs text-muted-foreground">
              Enter your vehicle's plate number / أدخل رقم لوحة مركبتك
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="smsMessage" className="text-sm font-medium">
              SMS Message / رسالة SMS
            </Label>
            <Input
              id="smsMessage"
              value={smsMessage}
              onChange={(e) => setSmsMessage(e.target.value)}
              placeholder="AUH14 47402 E21 6"
              className="font-mono h-12"
              dir="ltr"
              required
            />
            <p className="text-xs text-muted-foreground">
              Message format for government number 3009 / تنسيق الرسالة للرقم الحكومي 3009
            </p>
          </div>
          
          <div className={`flex gap-3 pt-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Button type="submit" variant="success" size="mobile" className="flex-1">
              <Plus className="h-4 w-4" />
              Add Vehicle / إضافة
            </Button>
            <Button
              type="button"
              variant="outline"
              size="mobile"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel / إلغاء
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}