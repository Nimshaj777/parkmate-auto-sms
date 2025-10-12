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
  vehicles: Vehicle[];
  language: 'en' | 'ar' | 'hi';
  hasActiveSubscription: boolean;
  onSubscriptionRequired: () => void;
  villaSubscriptions: import('@/types').VillaSubscription[];
}

export function AddVehicleDialog({ onAdd, villas, isRTL, vehicles, language, hasActiveSubscription, onSubscriptionRequired, villaSubscriptions }: AddVehicleDialogProps) {
  const [open, setOpen] = useState(false);
  const [plateNumber, setPlateNumber] = useState('');
  const [roomName, setRoomName] = useState('');
  const [smsMessage, setSmsMessage] = useState('');
  const [selectedVilla, setSelectedVilla] = useState(villas[0]?.id || '');

  const t = {
    en: { addVehicle: 'Add Vehicle', addNewVehicle: 'Add New Vehicle', villa: 'Villa', plateNumber: 'Plate Number', enterPlate: 'Enter your vehicle\'s plate number', roomFlat: 'Room/Flat Name', enterRoom: 'Enter room/flat identifier', smsMessage: 'SMS Message', messageFormat: 'Message format for government number', add: 'Add', cancel: 'Cancel', limitReached: 'Vehicle limit reached! Each villa can have maximum 20 vehicles. Please add another villa to continue.', subscriptionRequired: 'Subscription Required', activateFirst: 'Please activate your subscription first to add vehicles. Go to the Activate tab to enter your activation code.' },
    ar: { addVehicle: 'إضافة مركبة', addNewVehicle: 'إضافة مركبة جديدة', villa: 'الفيلا', plateNumber: 'رقم اللوحة', enterPlate: 'أدخل رقم لوحة مركبتك', roomFlat: 'اسم الغرفة/الشقة', enterRoom: 'أدخل معرف الغرفة/الشقة', smsMessage: 'رسالة SMS', messageFormat: 'تنسيق الرسالة للرقم الحكومي', add: 'إضافة', cancel: 'إلغاء', limitReached: 'تم الوصول إلى الحد الأقصى! كل فيلا يمكن أن تحتوي على 20 مركبة كحد أقصى. يرجى إضافة فيلا أخرى للمتابعة.', subscriptionRequired: 'الاشتراك مطلوب', activateFirst: 'يرجى تفعيل اشتراكك أولاً لإضافة المركبات. انتقل إلى علامة تبويب التفعيل لإدخال رمز التفعيل الخاص بك.' },
    hi: { addVehicle: 'वाहन जोड़ें', addNewVehicle: 'नया वाहन जोड़ें', villa: 'विला', plateNumber: 'नंबर प्लेट', enterPlate: 'अपने वाहन की नंबर प्लेट दर्ज करें', roomFlat: 'कमरा/फ्लैट का नाम', enterRoom: 'कमरा/फ्लैट पहचानकर्ता दर्ज करें', smsMessage: 'SMS संदेश', messageFormat: 'सरकारी नंबर के लिए संदेश प्रारूप', add: 'जोड़ें', cancel: 'रद्द करें', limitReached: 'वाहन सीमा पूरी हो गई! प्रत्येक विला में अधिकतम 20 वाहन हो सकते हैं। जारी रखने के लिए कृपया दूसरा विला जोड़ें।', subscriptionRequired: 'सदस्यता आवश्यक', activateFirst: 'वाहन जोड़ने के लिए कृपया पहले अपनी सदस्यता सक्रिय करें। सक्रियण कोड दर्ज करने के लिए सक्रिय करें टैब पर जाएं।' }
  };
  const text = t[language];

  const MAX_VEHICLES_PER_VILLA = 20;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if THIS SPECIFIC villa has an active subscription
    const villaSubscription = villaSubscriptions.find(
      sub => sub.villaId === selectedVilla && sub.isActive && new Date(sub.expiresAt) > new Date()
    );
    
    if (!villaSubscription) {
      alert(text.activateFirst);
      setOpen(false);
      onSubscriptionRequired();
      return;
    }
    
    if (!plateNumber.trim() || !smsMessage.trim() || !roomName.trim() || !selectedVilla) return;
    
    // Check vehicle limit for selected villa
    const vehiclesInVilla = vehicles.filter(v => v.villaId === selectedVilla).length;
    if (vehiclesInVilla >= MAX_VEHICLES_PER_VILLA) {
      alert(text.limitReached);
      return;
    }
    
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
          {text.addVehicle}
        </Button>
      </DialogTrigger>
      
      <DialogContent className={`mobile-container ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Car className="h-6 w-6 text-primary" />
            {text.addNewVehicle}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="villa" className="text-sm font-medium">
              {text.villa}
            </Label>
            <Select value={selectedVilla} onValueChange={setSelectedVilla}>
              <SelectTrigger>
                <SelectValue placeholder="Select villa" />
              </SelectTrigger>
              <SelectContent>
                {villas.map(villa => {
                  const vehicleCount = vehicles.filter(v => v.villaId === villa.id).length;
                  return (
                    <SelectItem key={villa.id} value={villa.id}>
                      {villa.name} ({vehicleCount}/{MAX_VEHICLES_PER_VILLA})
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="plateNumber" className="text-sm font-medium">
              {text.plateNumber}
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
              {text.enterPlate}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="roomName" className="text-sm font-medium">
              {text.roomFlat}
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
              {text.enterRoom}
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="smsMessage" className="text-sm font-medium">
              {text.smsMessage}
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
              {text.messageFormat}
            </p>
          </div>
          
          <div className={`flex gap-3 pt-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Button type="submit" variant="success" size="mobile" className="flex-1">
              <Plus className="h-4 w-4" />
              {text.add}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="mobile"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              {text.cancel}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}