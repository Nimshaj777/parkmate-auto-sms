import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Clock, Play, Bell, Home, Calendar } from 'lucide-react';
import { TimePicker } from '@/components/ui/time-picker';
import { format24To12Hour } from '@/utils/timeFormat';
import type { Villa, AutomationSchedule } from '@/types';

interface AutomationSettingsProps {
  villas: Villa[];
  schedules: AutomationSchedule[];
  onUpdateSchedule: (schedule: AutomationSchedule) => void;
  onCreateSchedule: (schedule: Omit<AutomationSchedule, 'id' | 'createdAt' | 'updatedAt'>) => void;
  isRTL: boolean;
  hasActiveSubscription: boolean;
  onSubscriptionRequired: () => void;
  villaSubscriptions: import('@/types').VillaSubscription[];
}

const DAYS_OF_WEEK = [
  { key: 0, label: 'Sunday / الأحد', short: 'Sun' },
  { key: 1, label: 'Monday / الاثنين', short: 'Mon' },
  { key: 2, label: 'Tuesday / الثلاثاء', short: 'Tue' },
  { key: 3, label: 'Wednesday / الأربعاء', short: 'Wed' },
  { key: 4, label: 'Thursday / الخميس', short: 'Thu' },
  { key: 5, label: 'Friday / الجمعة', short: 'Fri' },
  { key: 6, label: 'Saturday / السبت', short: 'Sat' }
];

export function AutomationSettings({ 
  villas, 
  schedules, 
  onUpdateSchedule, 
  onCreateSchedule, 
  isRTL,
  hasActiveSubscription,
  onSubscriptionRequired,
  villaSubscriptions
}: AutomationSettingsProps) {
  const [selectedVilla, setSelectedVilla] = useState(villas[0]?.id || '');
  const [time, setTime] = useState('08:00');
  const [daysOfWeek, setDaysOfWeek] = useState<boolean[]>(new Array(7).fill(false));
  const [isEnabled, setIsEnabled] = useState(false);

  const currentSchedule = schedules.find(s => s.villaId === selectedVilla);

  useEffect(() => {
    if (currentSchedule) {
      setTime(currentSchedule.time);
      setDaysOfWeek(currentSchedule.daysOfWeek);
      setIsEnabled(currentSchedule.enabled);
    } else {
      setTime('08:00');
      setDaysOfWeek(new Array(7).fill(false));
      setIsEnabled(false);
    }
  }, [currentSchedule, selectedVilla]);

  const handleSave = () => {
    // Check if THIS SPECIFIC villa has an active subscription
    const villaSubscription = villaSubscriptions.find(
      sub => sub.villaId === selectedVilla && sub.isActive && new Date(sub.expiresAt) > new Date()
    );
    
    if (!villaSubscription) {
      alert('Please activate your subscription first to use automation. Go to the Activate tab to enter your activation code.');
      onSubscriptionRequired();
      return;
    }

    const scheduleData = {
      villaId: selectedVilla,
      enabled: isEnabled,
      time,
      daysOfWeek
    };

    if (currentSchedule) {
      onUpdateSchedule({
        ...currentSchedule,
        ...scheduleData,
        updatedAt: new Date()
      });
    } else {
      onCreateSchedule(scheduleData);
    }
  };

  const toggleDay = (dayIndex: number) => {
    const newDays = [...daysOfWeek];
    newDays[dayIndex] = !newDays[dayIndex];
    setDaysOfWeek(newDays);
  };

  const selectedDaysCount = daysOfWeek.filter(Boolean).length;
  const currentVilla = villas.find(v => v.id === selectedVilla);
  
  // Check if current villa has active subscription
  const currentVillaHasSubscription = villaSubscriptions.some(
    sub => sub.villaId === selectedVilla && sub.isActive && new Date(sub.expiresAt) > new Date()
  );

  return (
    <div className="space-y-6">
      <Card className="card-mobile">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Automation Settings / إعدادات الأتمتة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Villa Selection */}
          <div className="space-y-2">
            <Label>Villa / الفيلا</Label>
            <Select value={selectedVilla} onValueChange={setSelectedVilla}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {villas.map(villa => (
                  <SelectItem key={villa.id} value={villa.id}>
                    {villa.name} ({villa.defaultSmsNumber})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subscription Warning */}
          {!currentVillaHasSubscription && (
            <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
              <p className="text-sm text-destructive font-medium">
                ⚠️ Subscription Required: This villa needs an active subscription. Go to Activate tab to activate it.
              </p>
            </div>
          )}

          {/* Enable/Disable */}
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div>
              <Label className="text-base font-medium">
                Enable Automation / تفعيل الأتمتة
              </Label>
              <p className="text-sm text-muted-foreground">
                Automatically send SMS at scheduled times
              </p>
            </div>
            <Switch
              checked={isEnabled}
              onCheckedChange={(checked) => {
                if (!currentVillaHasSubscription) {
                  alert('Please activate this villa first');
                  onSubscriptionRequired();
                  return;
                }
                setIsEnabled(checked);
              }}
              disabled={!currentVillaHasSubscription}
            />
          </div>

          {/* Time Selection */}
          <div className="space-y-2">
            <TimePicker
              value={time}
              onChange={setTime}
              label="Send Time / وقت الإرسال"
              isRTL={isRTL}
            />
            <p className="text-xs text-muted-foreground">
              SMS will be sent to {currentVilla?.defaultSmsNumber || '3009'}
            </p>
          </div>

          {/* Days Selection */}
          <div className="space-y-3">
            <Label>Days of Week / أيام الأسبوع</Label>
            <div className="grid grid-cols-7 gap-2">
              {DAYS_OF_WEEK.map((day) => (
                <Button
                  key={day.key}
                  variant={daysOfWeek[day.key] ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleDay(day.key)}
                  className="h-12 flex flex-col"
                >
                  <span className="text-xs">{day.short}</span>
                </Button>
              ))}
            </div>
            <div className="text-sm text-muted-foreground">
              {selectedDaysCount === 0 
                ? 'No days selected / لم يتم اختيار أيام'
                : `${selectedDaysCount} days selected / ${selectedDaysCount} أيام مختارة`
              }
            </div>
          </div>

          {/* Schedule Status */}
          {currentSchedule && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Current Schedule</span>
                </div>
                <Badge variant={currentSchedule.enabled ? "success" : "secondary"}>
                  {currentSchedule.enabled ? 'Active' : 'Disabled'}
                </Badge>
              </div>
              {currentSchedule.lastRun && (
                <p className="text-xs text-muted-foreground mt-1">
                  Last run: {currentSchedule.lastRun.toLocaleDateString()} at {format24To12Hour(currentSchedule.time)}
                </p>
              )}
            </div>
          )}

          {/* Save Button */}
          <Button 
            onClick={handleSave} 
            className="w-full" 
            size="lg"
            disabled={!selectedVilla || !currentVillaHasSubscription}
          >
            <Play className="h-4 w-4" />
            Save Automation / حفظ الأتمتة
          </Button>
        </CardContent>
      </Card>

      {/* Saved Automation Schedules */}
      <Card className="card-mobile">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Saved Automations / الأتمتة المحفوظة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {schedules.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm font-medium">No automations scheduled yet</p>
              <p className="text-xs mt-1">Configure a schedule above to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {schedules.map(schedule => {
                const villa = villas.find(v => v.id === schedule.villaId);
                const activeDays = DAYS_OF_WEEK.filter((_, index) => schedule.daysOfWeek[index]);
                const hasActiveSubscription = villaSubscriptions.some(
                  sub => sub.villaId === schedule.villaId && sub.isActive && new Date(sub.expiresAt) > new Date()
                );
                
                return (
                  <div
                    key={schedule.id}
                    className={`p-4 rounded-lg border transition-all cursor-pointer hover:shadow-md ${
                      schedule.enabled && hasActiveSubscription
                        ? 'bg-primary/5 border-primary/30' 
                        : 'bg-muted/20 border-border'
                    }`}
                    onClick={() => {
                      setSelectedVilla(schedule.villaId);
                      setTime(schedule.time);
                      setDaysOfWeek(schedule.daysOfWeek);
                      setIsEnabled(schedule.enabled);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-2 flex-1">
                        {/* Villa Name and Status */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <Home className="h-4 w-4 text-primary" />
                          <span className="font-semibold text-base">{villa?.name || 'Unknown Villa'}</span>
                          <Badge 
                            variant={schedule.enabled && hasActiveSubscription ? "default" : "secondary"} 
                            className="text-xs"
                          >
                            {schedule.enabled && hasActiveSubscription ? 'Active' : schedule.enabled ? 'No Subscription' : 'Disabled'}
                          </Badge>
                        </div>
                        
                        {/* Time and Phone */}
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-mono font-medium">{format24To12Hour(schedule.time)}</span>
                          <span className="text-muted-foreground">→</span>
                          <span className="text-muted-foreground">{villa?.defaultSmsNumber || '3009'}</span>
                        </div>
                        
                        {/* Active Days */}
                        <div className="flex flex-wrap gap-1.5">
                          {activeDays.length > 0 ? (
                            activeDays.map(day => (
                              <Badge key={day.key} variant="outline" className="text-xs px-2 py-0.5">
                                {day.short}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">No days selected</span>
                          )}
                        </div>
                        
                        {/* Last Run Info */}
                        {schedule.lastRun && (
                          <p className="text-xs text-green-600 dark:text-green-400">
                            ✓ Last sent: {new Date(schedule.lastRun).toLocaleDateString()} at {new Date(schedule.lastRun).toLocaleTimeString()}
                          </p>
                        )}
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedVilla(schedule.villaId);
                          setTime(schedule.time);
                          setDaysOfWeek(schedule.daysOfWeek);
                          setIsEnabled(schedule.enabled);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}