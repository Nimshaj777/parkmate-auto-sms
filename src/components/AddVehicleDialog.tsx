import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Car } from 'lucide-react';
import type { Vehicle, Villa } from '@/types';

interface AddVehicleDialogProps {
  onAdd: (vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt' | 'serialNumber'>) => void;
  villas: Villa[];
  isRTL: boolean;
}

export function AddVehicleDialog({ onAdd, villas, isRTL }: AddVehicleDialogProps) {
  const [open, setOpen] = useState(false);
  const [plateNumber, setPlateNumber] = useState('');
  const [roomName, setRoomName] = useState('');
  const [smsMessage, setSmsMessage] = useState('');
  const [selectedVilla, setSelectedVilla] = useState(villas[0]?.id || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!plateNumber.trim() || !smsMessage.trim() || !roomName.trim() || !selectedVilla) return;
    
    onAdd({
      plateNumber: plateNumber.trim(),
      roomName: roomName.trim(),
      smsMessage: smsMessage.trim(),
      status: 'pending',
      villaId: selectedVilla
    });
    
    // Reset form
    setPlateNumber('');
    setRoomName('');
    setSmsMessage('');
    setSelectedVilla(villas[0]?.id || '');
    setOpen(false);
  };

  // Auto-generate SMS message when plate number changes
  const handlePlateChange = (value: string) => {
    setPlateNumber(value);
    // Auto-format common UAE patterns with room info
    if (value && !smsMessage && roomName) {
      setSmsMessage(`${value} E21 6 ${roomName}`);
    } else if (value && !smsMessage) {
      setSmsMessage(`${value} E21 6`);
    }
  };

  // Update SMS when room changes
  const handleRoomChange = (value: string) => {
    setRoomName(value);
    if (plateNumber && value && !smsMessage) {
      setSmsMessage(`${plateNumber} E21 6 ${value}`);
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
            <Label htmlFor="villa" className="text-sm font-medium">
              Villa / الفيلا
            </Label>
            <Select value={selectedVilla} onValueChange={setSelectedVilla}>
              <SelectTrigger>
                <SelectValue placeholder="Select villa" />
              </SelectTrigger>
              <SelectContent>
                {villas.map(villa => (
                  <SelectItem key={villa.id} value={villa.id}>
                    {villa.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="plateNumber" className="text-sm font-medium">
              Plate Number / رقم اللوحة
            </Label>
            <Input
              id="plateNumber"
              value={plateNumber}
              onChange={(e) => handlePlateChange(e.target.value.toUpperCase())}
              placeholder="12345"
              className="text-center font-mono text-lg h-12"
              dir="ltr"
              required
            />
            <p className="text-xs text-muted-foreground">
              Enter your vehicle's plate number / أدخل رقم لوحة مركبتك
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="roomName" className="text-sm font-medium">
              Room/Flat Name / اسم الغرفة/الشقة
            </Label>
            <Input
              id="roomName"
              value={roomName}
              onChange={(e) => handleRoomChange(e.target.value)}
              placeholder="A101, Villa1-Room2, etc."
              className="h-12"
              required
            />
            <p className="text-xs text-muted-foreground">
              Enter room/flat identifier / أدخل معرف الغرفة/الشقة
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
              placeholder="12345 E21 6 A101"
              className="font-mono h-12"
              dir="ltr"
              required
            />
            <p className="text-xs text-muted-foreground">
              Message format for government number / تنسيق الرسالة للرقم الحكومي
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