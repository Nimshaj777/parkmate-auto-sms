import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Home, Plus, Edit, Trash2 } from 'lucide-react';
import type { Villa } from '@/types';

interface VillaManagerProps {
  villas: Villa[];
  onAdd: (villa: Omit<Villa, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdate: (id: string, updates: Partial<Villa>) => void;
  onDelete: (id: string) => void;
  isRTL: boolean;
  villaLimit?: number;
  language: 'en' | 'ar' | 'hi';
}

export function VillaManager({ villas, onAdd, onUpdate, onDelete, isRTL, villaLimit = 1, language }: VillaManagerProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingVilla, setEditingVilla] = useState<Villa | null>(null);
  const [villaName, setVillaName] = useState('');
  const [smsNumber, setSmsNumber] = useState('3009');

  const t = {
    en: { villas: 'Villas', villasUsed: 'villas used', addVilla: 'Add Villa', addNewVilla: 'Add New Villa', villaName: 'Villa Name', defaultNumber: 'Default SMS Number', add: 'Add', cancel: 'Cancel', save: 'Save', sms: 'SMS' },
    ar: { villas: 'الفيلات', villasUsed: 'فيلا مستخدمة', addVilla: 'إضافة فيلا', addNewVilla: 'إضافة فيلا جديدة', villaName: 'اسم الفيلا', defaultNumber: 'الرقم الافتراضي', add: 'إضافة', cancel: 'إلغاء', save: 'حفظ', sms: 'رسالة' },
    hi: { villas: 'विला', villasUsed: 'विला उपयोग में', addVilla: 'विला जोड़ें', addNewVilla: 'नया विला जोड़ें', villaName: 'विला का नाम', defaultNumber: 'डिफ़ॉल्ट SMS नंबर', add: 'जोड़ें', cancel: 'रद्द करें', save: 'सहेजें', sms: 'SMS' }
  };
  const text = t[language];

  const canAddVilla = villas.length < villaLimit;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!villaName.trim() || !smsNumber.trim()) return;

    if (!canAddVilla) {
      alert(`Villa limit reached! Your subscription allows ${villaLimit} villa(s). Please upgrade to add more.`);
      return;
    }

    onAdd({
      name: villaName.trim(),
      defaultSmsNumber: smsNumber.trim()
    });

    setVillaName('');
    setSmsNumber('3009');
    setShowAddDialog(false);
  };

  const handleEdit = (villa: Villa) => {
    setEditingVilla(villa);
    setVillaName(villa.name);
    setSmsNumber(villa.defaultSmsNumber);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVilla || !villaName.trim() || !smsNumber.trim()) return;

    onUpdate(editingVilla.id, {
      name: villaName.trim(),
      defaultSmsNumber: smsNumber.trim()
    });

    setEditingVilla(null);
    setVillaName('');
    setSmsNumber('3009');
  };

  const handleCancelEdit = () => {
    setEditingVilla(null);
    setVillaName('');
    setSmsNumber('3009');
  };

  return (
    <div className="space-y-4">
      <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div>
          <h3 className="text-lg font-semibold">{text.villas}</h3>
          <p className="text-xs text-muted-foreground mt-1">
            {villas.length} / {villaLimit} {text.villasUsed}
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" disabled={!canAddVilla}>
              <Plus className="h-4 w-4" />
              {text.addVilla}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{text.addNewVilla}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="villaName">{text.villaName}</Label>
                <Input
                  id="villaName"
                  value={villaName}
                  onChange={(e) => setVillaName(e.target.value)}
                  placeholder="Villa 1, Building A, etc."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smsNumber">{text.defaultNumber}</Label>
                <Input
                  id="smsNumber"
                  value={smsNumber}
                  onChange={(e) => setSmsNumber(e.target.value)}
                  placeholder="3009"
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">{text.add}</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddDialog(false)}
                  className="flex-1"
                >
                  {text.cancel}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3">
        {villas.map((villa) => (
          <Card key={villa.id} className="card-mobile">
            <CardContent className="p-4">
              {editingVilla?.id === villa.id ? (
                <form onSubmit={handleUpdate} className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor={`editName-${villa.id}`}>{text.villaName}</Label>
                    <Input
                      id={`editName-${villa.id}`}
                      value={villaName}
                      onChange={(e) => setVillaName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`editNumber-${villa.id}`}>{text.sms} Number</Label>
                    <Input
                      id={`editNumber-${villa.id}`}
                      value={smsNumber}
                      onChange={(e) => setSmsNumber(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" size="sm" className="flex-1">
                      {text.save}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleCancelEdit}
                      className="flex-1"
                    >
                      {text.cancel}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Home className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{villa.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {text.sms}: {villa.defaultSmsNumber}
                      </p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(villa)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {villa.id !== 'default' && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDelete(villa.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}