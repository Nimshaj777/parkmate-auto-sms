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
}

export function VillaManager({ villas, onAdd, onUpdate, onDelete, isRTL }: VillaManagerProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingVilla, setEditingVilla] = useState<Villa | null>(null);
  const [villaName, setVillaName] = useState('');
  const [smsNumber, setSmsNumber] = useState('3009');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!villaName.trim() || !smsNumber.trim()) return;

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
        <h3 className="text-lg font-semibold">Villas / الفيلات</h3>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4" />
              Add Villa / إضافة فيلا
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Villa / إضافة فيلا جديدة</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="villaName">Villa Name / اسم الفيلا</Label>
                <Input
                  id="villaName"
                  value={villaName}
                  onChange={(e) => setVillaName(e.target.value)}
                  placeholder="Villa 1, Building A, etc."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smsNumber">Default SMS Number / الرقم الافتراضي</Label>
                <Input
                  id="smsNumber"
                  value={smsNumber}
                  onChange={(e) => setSmsNumber(e.target.value)}
                  placeholder="3009"
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">Add / إضافة</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddDialog(false)}
                  className="flex-1"
                >
                  Cancel / إلغاء
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
                    <Label htmlFor={`editName-${villa.id}`}>Villa Name</Label>
                    <Input
                      id={`editName-${villa.id}`}
                      value={villaName}
                      onChange={(e) => setVillaName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`editNumber-${villa.id}`}>SMS Number</Label>
                    <Input
                      id={`editNumber-${villa.id}`}
                      value={smsNumber}
                      onChange={(e) => setSmsNumber(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" size="sm" className="flex-1">
                      Save / حفظ
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleCancelEdit}
                      className="flex-1"
                    >
                      Cancel / إلغاء
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
                        SMS: {villa.defaultSmsNumber}
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