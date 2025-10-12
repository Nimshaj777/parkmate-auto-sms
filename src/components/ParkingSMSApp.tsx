import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VehicleCard } from '@/components/VehicleCard';
import { AddVehicleDialog } from '@/components/AddVehicleDialog';
import { SMSStatusSheet } from '@/components/SMSStatusSheet';
import { VillaManager } from '@/components/VillaManager';
import { AutomationSettings } from '@/components/AutomationSettings';
import { VillaSubscriptionList } from '@/components/VillaSubscriptionList';
import { PreviouslyUsedCodes } from '@/components/PreviouslyUsedCodes';
import { Car, Send, Crown, Globe, MessageSquare, Moon, Sun, Trash2, Home, Clock } from 'lucide-react';
import { LocalStorage } from '@/utils/storage';
import { getTranslations, isRTL } from '@/utils/i18n';
import { useToast } from '@/hooks/use-toast';
import { VillaSubscriptionAPI } from '@/utils/villaSubscriptionApi';
import type { Vehicle, AppSettings, Villa, AutomationSchedule, VillaSubscription } from '@/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function ParkingSMSApp() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [villas, setVillas] = useState<Villa[]>([]);
  const [schedules, setSchedules] = useState<AutomationSchedule[]>([]);
  const [villaSubscriptions, setVillaSubscriptions] = useState<VillaSubscription[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    language: 'en',
    defaultSmsNumber: '3009',
    notificationsEnabled: true,
    automationEnabled: false
  });
  const [smsSheetOpen, setSmsSheetOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [clearDataDialog, setClearDataDialog] = useState(false);
  const [confirmClearDialog, setConfirmClearDialog] = useState(false);
  const [smsHistory, setSmsHistory] = useState<import('@/types').SMSHistoryEntry[]>([]);

  const { toast } = useToast();
  const translations = getTranslations(settings.language);
  const rtl = isRTL(settings.language);

  // Toggle theme
  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [vehiclesData, villasData, schedulesData, settingsData, villaSubsData, historyData] = await Promise.all([
          LocalStorage.getVehicles(),
          LocalStorage.getVillas(),
          LocalStorage.getAutomationSchedules(),
          LocalStorage.getSettings(),
          VillaSubscriptionAPI.getVillaSubscriptions(),
          LocalStorage.getSMSHistory()
        ]);
        
        setVehicles(vehiclesData);
        setVillas(villasData);
        setSchedules(schedulesData);
        setSettings(settingsData);
        setVillaSubscriptions(villaSubsData);
        setSmsHistory(historyData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Periodically refresh villa subscriptions (every 5 minutes)
  useEffect(() => {
    const checkVillaSubscriptions = async () => {
      try {
        const villaSubsData = await VillaSubscriptionAPI.getVillaSubscriptions();
        setVillaSubscriptions(villaSubsData);
      } catch (error) {
        console.error('Error checking villa subscriptions:', error);
      }
    };

  const interval = setInterval(checkVillaSubscriptions, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Normalize and reconcile schedules whenever villas or schedules change
  useEffect(() => {
    if (loading) return;
    const villaIds = new Set(villas.map(v => v.id));

    // Map unknown schedule villaIds to the single existing villa (if only one)
    const remapped = schedules.map(s => {
      if (!villaIds.has(s.villaId) && villas.length === 1) {
        return { ...s, villaId: villas[0].id, updatedAt: new Date() } as AutomationSchedule;
      }
      return s;
    });

    // Deduplicate: keep latest per villaId
    const byVilla = new Map<string, AutomationSchedule>();
    for (const s of remapped) {
      if (!villaIds.has(s.villaId)) continue; // drop schedules pointing to missing villas (when multiple)
      const existing = byVilla.get(s.villaId);
      if (!existing) byVilla.set(s.villaId, s);
      else {
        const existingTime = new Date(existing.updatedAt || existing.createdAt).getTime();
        const currentTime = new Date(s.updatedAt || s.createdAt).getTime();
        if (currentTime >= existingTime) byVilla.set(s.villaId, s);
      }
    }

    const normalized = Array.from(byVilla.values());

    // If anything changed, persist
    const currentKey = JSON.stringify(schedules.map(s => ({ villaId: s.villaId, id: s.id })));
    const nextKey = JSON.stringify(normalized.map(s => ({ villaId: s.villaId, id: s.id })));
    if (currentKey !== nextKey) {
      setSchedules(normalized);
      LocalStorage.saveAutomationSchedules(normalized);
    }
  }, [villas, schedules, loading]);

  const handleAddVehicle = async (vehicleData: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt' | 'serialNumber'>) => {
    // Generate serial number based on existing vehicles in the same villa
    const villaVehicles = vehicles.filter(v => v.villaId === vehicleData.villaId);
    const serialNumber = villaVehicles.length + 1;
    
    const newVehicle: Vehicle = {
      ...vehicleData,
      id: Date.now().toString(),
      serialNumber,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const updatedVehicles = [...vehicles, newVehicle];
    setVehicles(updatedVehicles);
    await LocalStorage.saveVehicles(updatedVehicles);
    
    toast({
      title: "Vehicle Added",
      description: `${newVehicle.plateNumber} has been added successfully.`
    });
  };

  const handleUpdateVehicle = async (id: string, updates: Partial<Vehicle>) => {
    setVehicles((prev) => {
      const updatedVehicles = prev.map(v => 
        v.id === id 
          ? { ...v, ...updates, updatedAt: new Date(), lastSent: updates.status === 'sent' ? new Date() : v.lastSent }
          : v
      );
      // Persist based on the latest state to avoid stale overwrites during sequential updates
      LocalStorage.saveVehicles(updatedVehicles);
      return updatedVehicles;
    });
  };

  const handleDeleteVehicle = async (id: string) => {
    const updatedVehicles = vehicles.filter(v => v.id !== id);
    setVehicles(updatedVehicles);
    await LocalStorage.saveVehicles(updatedVehicles);
    
    toast({
      title: "Vehicle Deleted",
      description: "Vehicle has been removed successfully."
    });
  };

  // Villa management
  const handleAddVilla = async (villaData: Omit<Villa, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newVilla: Villa = {
      ...villaData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const updatedVillas = [...villas, newVilla];
    setVillas(updatedVillas);
    await LocalStorage.saveVillas(updatedVillas);
    
    toast({
      title: "Villa Added",
      description: `${newVilla.name} has been added successfully.`
    });
  };

  const handleUpdateVilla = async (id: string, updates: Partial<Villa>) => {
    const updatedVillas = villas.map(v => 
      v.id === id ? { ...v, ...updates, updatedAt: new Date() } : v
    );
    
    setVillas(updatedVillas);
    await LocalStorage.saveVillas(updatedVillas);
  };

  const handleDeleteVilla = async (id: string) => {
    // Don't allow deleting default villa or villas with vehicles
    if (id === 'default' || vehicles.some(v => v.villaId === id)) {
      toast({
        title: "Cannot Delete Villa",
        description: "Villa has vehicles or is the default villa.",
        variant: "destructive"
      });
      return;
    }
    
    const updatedVillas = villas.filter(v => v.id !== id);
    setVillas(updatedVillas);
    await LocalStorage.saveVillas(updatedVillas);
    
    toast({
      title: "Villa Deleted",
      description: "Villa has been removed successfully."
    });
  };

  // Automation management
  const handleUpdateSchedule = async (schedule: AutomationSchedule) => {
    const updatedSchedules = schedules.map(s => 
      s.id === schedule.id ? schedule : s
    );
    
    setSchedules(updatedSchedules);
    await LocalStorage.saveAutomationSchedules(updatedSchedules);
    
    toast({
      title: "Schedule Updated",
      description: "Automation schedule has been saved."
    });
  };

  const handleCreateSchedule = async (scheduleData: Omit<AutomationSchedule, 'id' | 'createdAt' | 'updatedAt'>) => {
    // Check if schedule already exists for this villa
    const existingScheduleIndex = schedules.findIndex(s => s.villaId === scheduleData.villaId);
    
    let updatedSchedules: AutomationSchedule[];
    
    if (existingScheduleIndex >= 0) {
      // Update existing schedule instead of creating duplicate
      updatedSchedules = schedules.map((s, idx) => 
        idx === existingScheduleIndex 
          ? { ...s, ...scheduleData, updatedAt: new Date() }
          : s
      );
      
      toast({
        title: "Schedule Updated",
        description: "Automation schedule has been updated."
      });
    } else {
      // Create new schedule
      const newSchedule: AutomationSchedule = {
        ...scheduleData,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      updatedSchedules = [...schedules, newSchedule];
      
      toast({
        title: "Schedule Created",
        description: "Automation schedule has been created."
      });
    }
    
    setSchedules(updatedSchedules);
    await LocalStorage.saveAutomationSchedules(updatedSchedules);
  };

  const handleLanguageSwitch = async () => {
    const languageCycle: Array<'en' | 'ar' | 'hi'> = ['en', 'ar', 'hi'];
    const currentIndex = languageCycle.indexOf(settings.language);
    const nextIndex = (currentIndex + 1) % languageCycle.length;
    const newLanguage = languageCycle[nextIndex];
    
    const newSettings = { ...settings, language: newLanguage };
    setSettings(newSettings);
    await LocalStorage.saveSettings(newSettings);
    
    toast({
      title: "Language Changed",
      description: `${newLanguage === 'en' ? 'English' : newLanguage === 'ar' ? 'العربية' : 'हिंदी'}`
    });
  };

  const handleClearAllData = async () => {
    try {
      // Clear vehicles, villas, automation schedules, and SMS history - preserve subscriptions and settings
      await Promise.all([
        LocalStorage.saveVehicles([]),
        LocalStorage.saveVillas([]),
        LocalStorage.saveAutomationSchedules([]),
        LocalStorage.saveSMSHistory([]),
      ]);
      setVehicles([]);
      setVillas([]);
      setSchedules([]);
      setSmsHistory([]);
      
      toast({ 
        title: settings.language === 'ar' ? "تم مسح البيانات" : settings.language === 'hi' ? "डेटा साफ़ किया गया" : "Data Cleared", 
        description: settings.language === 'ar' 
          ? "تم حذف المركبات والفلل وجداول الأتمتة. اشتراكاتك في قاعدة البيانات لا تزال آمنة. يمكنك إعادة تنشيط الفلل باستخدام نفس الأكواد."
          : settings.language === 'hi'
          ? "वाहन, विला और ऑटोमेशन शेड्यूल हटा दिए गए। आपकी सदस्यताएं डेटाबेस में सुरक्षित हैं। उन्हीं कोड का उपयोग करके विला को फिर से सक्रिय करें।"
          : "Vehicles, villas and automation schedules cleared. Your subscriptions are safe in the backend. Re-activate villas using the same codes."
      });
      
      setClearDataDialog(false);
      setConfirmClearDialog(false);
    } catch (error) {
      console.error('Error clearing data:', error);
      toast({ 
        title: "Error", 
        description: "Failed to clear data",
        variant: "destructive"
      });
    }
  };
  const handleVillaSubscriptionUpdate = async () => {
    // Reload villa subscriptions after activation
    try {
      const villaSubsData = await VillaSubscriptionAPI.getVillaSubscriptions();
      setVillaSubscriptions(villaSubsData);
    } catch (error) {
      console.error('Error refreshing villa subscriptions:', error);
    }
  };

  const handleSMSStatusUpdate = async (vehicleId: string, status: Vehicle['status']) => {
    await handleUpdateVehicle(vehicleId, { status });
  };

  // Check if any villa has an active subscription
  const hasActiveVillaSubscription = villaSubscriptions.some(
    sub => sub.isActive && new Date(sub.expiresAt) > new Date()
  );
  const canUsePremiumFeatures = hasActiveVillaSubscription;

  const pendingCount = vehicles.filter(v => v.status === 'pending' || v.status === 'failed').length;
  const sentCount = vehicles.filter(v => v.status === 'sent' || v.status === 'verified').length;

  if (loading) {
    return (
      <div className="mobile-container flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`mobile-container min-h-screen bg-background transition-colors ${rtl ? 'text-right' : 'text-left'}`}
      dir={rtl ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-40 py-4">
        <div className={`flex items-center justify-between ${rtl ? 'flex-row-reverse' : ''}`}>
          <div className={`flex items-center gap-3 ${rtl ? 'flex-row-reverse' : ''}`}>
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <Car className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{translations.appName}</h1>
              <p className="text-sm text-muted-foreground">
                {vehicles.length} {translations.vehicles}
              </p>
            </div>
          </div>
          
          <div className={`flex items-center gap-2 ${rtl ? 'flex-row-reverse' : ''}`}>
            <Button
              onClick={toggleTheme}
              variant="outline"
              size="icon"
              className="h-10 w-10"
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button
              onClick={handleLanguageSwitch}
              variant="outline"
              size="icon"
              className="h-10 w-10 relative"
              title="Switch Language: English → العربية → हिंदी"
            >
              <Globe className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 text-[8px] bg-primary text-primary-foreground rounded-full px-1 font-bold">
                {settings.language.toUpperCase()}
              </span>
            </Button>
            <Button
              onClick={() => setClearDataDialog(true)}
              variant="outline"
              size="icon"
              className="h-10 w-10"
              title={settings.language === 'ar' ? "مسح كل البيانات" : settings.language === 'hi' ? "सभी डेटा साफ़ करें" : "Clear All Data"}
            >
            <Trash2 className="h-4 w-4" />
            </Button>
            <Badge variant={canUsePremiumFeatures ? "success" : "destructive"} className="text-xs">
              {canUsePremiumFeatures ? "Active" : "Expired"}
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20 pt-4">
        <Tabs defaultValue="vehicles" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-muted">
            <TabsTrigger value="vehicles" className="flex items-center gap-2">
              <Car className="h-4 w-4" />
              {translations.vehicles}
            </TabsTrigger>
            <TabsTrigger value="villas" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              {translations.villas}
            </TabsTrigger>
            <TabsTrigger value="sms" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              SMS
            </TabsTrigger>
            <TabsTrigger value="automation" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {translations.automation}
            </TabsTrigger>
            <TabsTrigger value="subscription" className="flex items-center gap-2">
              <Crown className="h-4 w-4" />
              {translations.activate}
            </TabsTrigger>
          </TabsList>

          {/* Vehicles Tab */}
          <TabsContent value="vehicles" className="space-y-4">
            <div className={`flex items-center justify-between ${rtl ? 'flex-row-reverse' : ''}`}>
              <h2 className="text-lg font-semibold text-foreground">{translations.vehicles}</h2>
              <Badge variant="secondary">
                {vehicles.length} {translations.vehicles.toLowerCase()}
              </Badge>
            </div>
            
            <AddVehicleDialog 
              onAdd={handleAddVehicle} 
              villas={villas} 
              isRTL={rtl} 
              vehicles={vehicles} 
              language={settings.language}
              hasActiveSubscription={canUsePremiumFeatures}
              villaSubscriptions={villaSubscriptions}
              onSubscriptionRequired={() => {
                const tabsList = document.querySelector('[role="tablist"]');
                const activateTab = tabsList?.querySelector('[value="subscription"]') as HTMLElement;
                activateTab?.click();
              }}
            />
            
            {vehicles.length === 0 ? (
              <Card className="card-mobile text-center py-8">
                <Car className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-semibold mb-2 text-foreground">No vehicles added yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Add your first vehicle to start sending parking SMS messages
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {/* Group vehicles by villa */}
                {villas.map(villa => {
                  const villaVehicles = vehicles.filter(v => v.villaId === villa.id);
                  if (villaVehicles.length === 0) return null;
                  
                  return (
                    <div key={villa.id} className="space-y-3">
                      <div className={`flex items-center gap-3 ${rtl ? 'flex-row-reverse' : ''}`}>
                        <Home className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold text-foreground">{villa.name}</h3>
                        <Badge variant="outline">{villaVehicles.length}</Badge>
                        <div className="text-sm text-muted-foreground">
                          SMS: {villa.defaultSmsNumber}
                        </div>
                      </div>
                      
                      <div className="space-y-3 pl-8">
                        {villaVehicles
                          .sort((a, b) => a.serialNumber - b.serialNumber)
                          .map((vehicle, index) => (
                          <div key={vehicle.id} className="relative">
                            <div className="absolute -left-6 top-4 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                              {vehicle.serialNumber}
                            </div>
                            <VehicleCard
                              vehicle={vehicle}
                              onUpdate={handleUpdateVehicle}
                              onDelete={handleDeleteVehicle}
                              isRTL={rtl}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Villas Tab */}
          <TabsContent value="villas" className="space-y-4">
            <VillaManager
              villas={villas}
              onAdd={handleAddVilla}
              onUpdate={handleUpdateVilla}
              onDelete={handleDeleteVilla}
              isRTL={rtl}
              villaLimit={999}
              language={settings.language}
            />
          </TabsContent>

            {/* SMS Tab */}
            <TabsContent value="sms" className="space-y-4">
              <div className={`flex items-center justify-between ${rtl ? 'flex-row-reverse' : ''}`}>
                <h2 className="text-lg font-semibold text-foreground">SMS Status</h2>
                <Badge variant="secondary">
                  {pendingCount} pending
                </Badge>
              </div>
              
              {/* Upcoming Scheduled SMS Queue */}
              {schedules.filter(s => s.enabled).length > 0 && (
                <Card className="card-mobile border-primary/20 bg-primary/5">
                  <div className="space-y-3">
                    <div className={`flex items-center gap-2 ${rtl ? 'flex-row-reverse' : ''}`}>
                      <Clock className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-foreground">
                        {settings.language === 'ar' ? 'الرسائل المجدولة القادمة' : settings.language === 'hi' ? 'आगामी अनुसूचित SMS' : 'Upcoming Scheduled SMS'}
                      </h3>
                      <Badge variant="default" className="ml-auto">
                        {schedules.filter(s => s.enabled).length} {settings.language === 'ar' ? 'نشط' : settings.language === 'hi' ? 'सक्रिय' : 'Active'}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      {schedules.filter(s => s.enabled).map(schedule => {
                        const villa = villas.find(v => v.id === schedule.villaId);
                        if (!villa) return null;
                        
                        const villaVehicles = vehicles.filter(v => v.villaId === villa.id);
                        const pendingVehicles = villaVehicles.filter(v => v.status === 'pending' || v.status === 'failed');
                        
                        // Calculate next run time safely
                        const hasDays = Array.isArray(schedule.daysOfWeek) && schedule.daysOfWeek.some(Boolean);
                        const now = new Date();
                        const [hours, minutes] = (schedule.time || '00:00').split(':');
                        let nextRun: Date | null = null;
                        
                        if (hasDays) {
                          nextRun = new Date();
                          nextRun.setHours(parseInt(hours || '0'), parseInt(minutes || '0'), 0, 0);
                          
                          // If time has passed today, check following day
                          if (nextRun <= now) {
                            nextRun.setDate(nextRun.getDate() + 1);
                          }
                          
                          // Find next matching day within a week max (avoid infinite loops)
                          for (let i = 0; i < 7; i++) {
                            if (schedule.daysOfWeek[nextRun.getDay()]) break;
                            nextRun.setDate(nextRun.getDate() + 1);
                          }
                        }
                        
                        const daysOfWeekLabels = settings.language === 'ar' 
                          ? ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
                          : settings.language === 'hi'
                          ? ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि']
                          : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                        
                        const activeDays = hasDays
                          ? schedule.daysOfWeek
                              .map((active, i) => active ? daysOfWeekLabels[i] : null)
                              .filter(Boolean)
                              .join(', ')
                          : (settings.language === 'ar' ? 'لا توجد أيام محددة' : settings.language === 'hi' ? 'कोई दिन चुना नहीं' : 'No days selected');
                        
                        return (
                          <Card key={schedule.id} className="p-3 bg-background border-muted">
                            <div className="space-y-2">
                              <div className={`flex items-center justify-between ${rtl ? 'flex-row-reverse' : ''}`}>
                                <div className={`flex items-center gap-2 ${rtl ? 'flex-row-reverse' : ''}`}>
                                  <Home className="h-4 w-4 text-primary" />
                                  <span className="font-semibold text-sm">{villa.name}</span>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {schedule.time}
                                </Badge>
                              </div>
                              
                              <div className={`flex items-center gap-2 text-xs text-muted-foreground ${rtl ? 'flex-row-reverse' : ''}`}>
                                <Clock className="h-3 w-3" />
                                <span>
                                  {settings.language === 'ar' ? 'التشغيل التالي:' : settings.language === 'hi' ? 'अगली रन:' : 'Next run:'} {nextRun ? nextRun.toLocaleDateString(settings.language === 'ar' ? 'ar-AE' : settings.language === 'hi' ? 'hi-IN' : 'en-US', { weekday: 'short', month: 'short', day: 'numeric' }) + ' @ ' + schedule.time : (settings.language === 'ar' ? 'لم يتم اختيار أيام' : settings.language === 'hi' ? 'कोई दिन चुना नहीं' : 'No days selected')}
                                </span>
                              </div>
                              
                              <div className={`flex items-center gap-2 text-xs ${rtl ? 'flex-row-reverse' : ''}`}>
                                <span className="text-muted-foreground">
                                  {settings.language === 'ar' ? 'الأيام:' : settings.language === 'hi' ? 'दिन:' : 'Days:'} {activeDays}
                                </span>
                              </div>
                              
                              <div className={`flex items-center justify-between pt-2 border-t ${rtl ? 'flex-row-reverse' : ''}`}>
                                <div className={`flex items-center gap-2 ${rtl ? 'flex-row-reverse' : ''}`}>
                                  <Car className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">
                                    {villaVehicles.length} {settings.language === 'ar' ? 'مركبة' : settings.language === 'hi' ? 'वाहन' : 'vehicles'}
                                  </span>
                                </div>
                                <Badge variant={pendingVehicles.length > 0 ? "secondary" : "outline"} className="text-xs">
                                  {pendingVehicles.length} {settings.language === 'ar' ? 'في الانتظار' : settings.language === 'hi' ? 'लंबित' : 'pending'}
                                </Badge>
                              </div>
                              
                              {pendingVehicles.length > 0 && (
                                <div className="pt-2">
                                  <details className="text-xs">
                                    <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                                      {settings.language === 'ar' ? 'عرض المركبات المعلقة' : settings.language === 'hi' ? 'लंबित वाहन देखें' : 'View pending vehicles'} ({pendingVehicles.length})
                                    </summary>
                                    <div className="mt-2 space-y-1">
                                      {pendingVehicles.slice(0, 5).map(vehicle => (
                                        <div key={vehicle.id} className={`flex items-center justify-between p-1 rounded bg-muted/30 ${rtl ? 'flex-row-reverse' : ''}`}>
                                          <span className="text-xs font-mono">{vehicle.plateNumber}</span>
                                          <span className="text-xs text-muted-foreground">{vehicle.roomName}</span>
                                        </div>
                                      ))}
                                      {pendingVehicles.length > 5 && (
                                        <div className="text-center text-xs text-muted-foreground">
                                          +{pendingVehicles.length - 5} {settings.language === 'ar' ? 'أكثر' : settings.language === 'hi' ? 'अधिक' : 'more'}
                                        </div>
                                      )}
                                    </div>
                                  </details>
                                </div>
                              )}
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                    
                    <div className={`flex items-center gap-2 text-xs text-muted-foreground ${rtl ? 'flex-row-reverse' : ''}`}>
                      <span>
                        {settings.language === 'ar' 
                          ? 'ℹ️ سيتم إرسال هذه الرسائل تلقائيًا في الأوقات المحددة'
                          : settings.language === 'hi'
                          ? 'ℹ️ ये SMS निर्धारित समय पर स्वचालित रूप से भेजे जाएंगे'
                          : 'ℹ️ These SMS will be sent automatically at the scheduled times'}
                      </span>
                    </div>
                  </div>
                </Card>
              )}
              
              {/* Send SMS per Villa */}
              <div className="space-y-3">
                {villas.map(villa => {
                  const villaVehicles = vehicles.filter(v => v.villaId === villa.id);
                  const villaPendingCount = villaVehicles.filter(v => v.status === 'pending' || v.status === 'failed').length;
                  
                  if (villaVehicles.length === 0) return null;
                  
                  return (
                    <Card key={villa.id} className="card-mobile">
                      <div className="space-y-3">
                        <div className={`flex items-center justify-between ${rtl ? 'flex-row-reverse' : ''}`}>
                          <div className={`flex items-center gap-2 ${rtl ? 'flex-row-reverse' : ''}`}>
                            <Home className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold text-foreground">{villa.name}</h3>
                          </div>
                          <Badge variant="outline">
                            {villaPendingCount} pending
                          </Badge>
                        </div>
                        
                        <Button
                          onClick={async () => {
                            if (!canUsePremiumFeatures) {
                              toast({
                                title: settings.language === 'ar' ? 'الاشتراك مطلوب' : settings.language === 'hi' ? 'सदस्यता आवश्यक' : 'Subscription Required',
                                description: settings.language === 'ar' ? 'يرجى تفعيل اشتراكك أولاً لإرسال رسائل SMS. انتقل إلى علامة تبويب التفعيل.' : settings.language === 'hi' ? 'SMS भेजने के लिए कृपया पहले अपनी सदस्यता सक्रिय करें। सक्रिय करें टैब पर जाएं।' : 'Please activate your subscription first to send SMS. Go to the Activate tab.',
                                variant: "destructive"
                              });
                              const tabsList = document.querySelector('[role="tablist"]');
                              const activateTab = tabsList?.querySelector('[value="subscription"]') as HTMLElement;
                              activateTab?.click();
                              return;
                            }
                            
                            // Filter vehicles for this villa only
                            const villaVehiclesToSend = villaVehicles.filter(v => v.status === 'pending' || v.status === 'failed');
                            
                            if (villaVehiclesToSend.length === 0) return;
                            
                            // Show starting toast
                            toast({
                              title: "Sending SMS / جاري الإرسال",
                              description: `Sending ${villaVehiclesToSend.length} messages for ${villa.name} / إرسال ${villaVehiclesToSend.length} رسائل لـ ${villa.name}`
                            });
                            
                            // Send SMS sequentially (one by one)
                            for (let i = 0; i < villaVehiclesToSend.length; i++) {
                              const vehicle = villaVehiclesToSend[i];
                              
                              try {
                                // Simulate SMS sending delay (1 second per message)
                                await new Promise(resolve => setTimeout(resolve, 1000));
                                
                                // Randomly simulate failures (10% chance) for realistic testing
                                const success = Math.random() > 0.1;
                                
                                if (success) {
                                  // Update vehicle status to sent
                                  await handleUpdateVehicle(vehicle.id, { status: 'sent', lastSent: new Date() });
                                  await LocalStorage.logSMSToHistory(true);
                                } else {
                                  // Mark as failed
                                  await handleUpdateVehicle(vehicle.id, { status: 'failed', lastSent: new Date() });
                                  await LocalStorage.logSMSToHistory(false);
                                }
                              } catch (error) {
                                console.error(`Failed to send SMS for vehicle ${vehicle.plateNumber}:`, error);
                                await handleUpdateVehicle(vehicle.id, { status: 'failed' });
                                await LocalStorage.logSMSToHistory(false);
                              }
                            }
                            
                            // Reload SMS history after sending
                            const updatedHistory = await LocalStorage.getSMSHistory();
                            setSmsHistory(updatedHistory);
                            
                            // Show completion toast
                            toast({
                              title: "SMS Sent / تم الإرسال",
                              description: `Successfully sent ${villaVehiclesToSend.length} messages for ${villa.name} / تم إرسال ${villaVehiclesToSend.length} رسائل لـ ${villa.name}`
                            });
                          }}
                          variant="default"
                          size="lg"
                          className="w-full"
                          disabled={villaPendingCount === 0}
                        >
                          <Send className="h-5 w-5" />
                          Send All for {villa.name} ({villaPendingCount}) / إرسال الكل لـ {villa.name}
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
              
              {!canUsePremiumFeatures && (
                <Card className="card-mobile border-warning/20 bg-warning/5">
                  <div className="text-center space-y-2">
                    <Crown className="h-8 w-8 text-warning mx-auto" />
                    <h3 className="font-semibold text-foreground">{translations.subscriptionExpired}</h3>
                    <p className="text-sm text-muted-foreground">
                      Activate your subscription to send SMS messages
                    </p>
                  </div>
                </Card>
              )}
              
              {/* SMS Summary Cards */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="card-mobile text-center">
                  <div className="text-2xl font-bold text-success">{sentCount}</div>
                  <div className="text-sm text-muted-foreground">Sent / مرسل</div>
                </Card>
                <Card className="card-mobile text-center">
                  <div className="text-2xl font-bold text-warning">{pendingCount}</div>
                  <div className="text-sm text-muted-foreground">Pending / في الانتظار</div>
                </Card>
              </div>
              
              {/* 7-Day SMS History */}
              <Card className="card-mobile">
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">{translations.smsHistory} - {translations.last7Days}</h3>
                  <div className="space-y-2">
                    {[...Array(7)].map((_, i) => {
                      const date = new Date();
                      date.setDate(date.getDate() - i);
                      const dateStr = date.toLocaleDateString(settings.language === 'ar' ? 'ar-AE' : 'en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      });
                      
                      // Get actual data from SMS history
                      const historyDate = date.toISOString().split('T')[0];
                      const historyEntry = smsHistory.find(h => h.date === historyDate);
                      const successful = historyEntry?.successful || 0;
                      const errors = historyEntry?.errors || 0;
                      
                      return (
                        <div key={i} className={`flex items-center justify-between p-2 rounded-lg bg-muted/30 ${rtl ? 'flex-row-reverse' : ''}`}>
                          <span className="text-sm font-medium text-foreground">{dateStr}</span>
                          <div className={`flex items-center gap-4 ${rtl ? 'flex-row-reverse' : ''}`}>
                            <div className="text-center">
                              <div className="text-sm font-semibold text-success">{successful}</div>
                              <div className="text-xs text-muted-foreground">{translations.successful}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm font-semibold text-destructive">{errors}</div>
                              <div className="text-xs text-muted-foreground">{translations.errors}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>
            </TabsContent>

          {/* Automation Tab */}
          <TabsContent value="automation" className="space-y-4">
            <AutomationSettings
              villas={villas}
              schedules={schedules}
              onUpdateSchedule={handleUpdateSchedule}
              onCreateSchedule={handleCreateSchedule}
              isRTL={rtl}
              hasActiveSubscription={canUsePremiumFeatures}
              villaSubscriptions={villaSubscriptions}
              onSubscriptionRequired={() => {
                const tabsList = document.querySelector('[role="tablist"]');
                const activateTab = tabsList?.querySelector('[value="subscription"]') as HTMLElement;
                activateTab?.click();
              }}
            />
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription" className="space-y-4">
            <VillaSubscriptionList
              villas={villas}
              villaSubscriptions={villaSubscriptions}
              onUpdate={handleVillaSubscriptionUpdate}
              language={settings.language}
              direction={rtl ? 'rtl' : 'ltr'}
            />
            
            <PreviouslyUsedCodes />
          </TabsContent>
        </Tabs>
      </main>

      {/* SMS Status Sheet */}
      <SMSStatusSheet
        open={smsSheetOpen}
        onOpenChange={setSmsSheetOpen}
        vehicles={vehicles}
        onStatusUpdate={handleSMSStatusUpdate}
        isRTL={rtl}
      />

      {/* First Confirmation Dialog */}
      <AlertDialog open={clearDataDialog} onOpenChange={setClearDataDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {settings.language === 'ar' ? '⚠️ تحذير: مسح جميع البيانات' : settings.language === 'hi' ? '⚠️ चेतावनी: सभी डेटा साफ़ करें' : '⚠️ Warning: Clear All Data'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {settings.language === 'ar' 
                ? 'سيؤدي هذا إلى حذف جميع المركبات والفلل من جهازك فقط. اشتراكات الفلل الخاصة بك ستبقى آمنة في قاعدة البيانات. انتقل إلى علامة تبويب "التفعيل" وتحقق من "الأكواد المستخدمة سابقًا" لإعادة تنشيط الفلل الخاصة بك. هل أنت متأكد؟' 
                : settings.language === 'hi' 
                ? 'यह केवल आपके डिवाइस से सभी वाहनों और विला को हटा देगा। आपकी विला सदस्यताएं डेटाबेस में सुरक्षित रहेंगी। अपने विला को फिर से सक्रिय करने के लिए "सक्रिय करें" टैब पर जाएं और "पहले उपयोग किए गए कोड" देखें। क्या आप सुनिश्चित हैं?' 
                : 'This will delete all vehicles and villas from your device only. Your villa subscriptions will remain safe in the database. Go to the "Activate" tab and check "Previously Used Codes" to reactivate your villas. Are you sure?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {settings.language === 'ar' ? 'إلغاء' : settings.language === 'hi' ? 'रद्द करें' : 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              setClearDataDialog(false);
              setConfirmClearDialog(true);
            }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {settings.language === 'ar' ? 'متابعة' : settings.language === 'hi' ? 'जारी रखें' : 'Continue'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Second Confirmation Dialog */}
      <AlertDialog open={confirmClearDialog} onOpenChange={setConfirmClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {settings.language === 'ar' ? '🚨 تأكيد نهائي' : settings.language === 'hi' ? '🚨 अंतिम पुष्टि' : '🚨 Final Confirmation'}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p className="font-semibold">
                {settings.language === 'ar' 
                  ? 'سيتم حذف البيانات التالية:' 
                  : settings.language === 'hi' 
                  ? 'निम्नलिखित डेटा हटाया जाएगा:' 
                  : 'The following data will be deleted:'}
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  {settings.language === 'ar' 
                    ? `${vehicles.length} مركبات` 
                    : settings.language === 'hi' 
                    ? `${vehicles.length} वाहन` 
                    : `${vehicles.length} vehicles`}
                </li>
                <li>
                  {settings.language === 'ar' 
                    ? `${villas.length} فلل` 
                    : settings.language === 'hi' 
                    ? `${villas.length} विला` 
                    : `${villas.length} villas`}
                </li>
              </ul>
              <p className="text-green-600 dark:text-green-400 font-semibold mt-4">
                {settings.language === 'ar' 
                  ? '✓ اشتراكك سيبقى نشطًا' 
                  : settings.language === 'hi' 
                  ? '✓ आपकी सदस्यता सक्रिय रहेगी' 
                  : '✓ Your subscription will remain active'}
              </p>
              <p className="text-destructive font-semibold mt-2">
                {settings.language === 'ar' 
                  ? 'لا يمكن التراجع عن هذا الإجراء!' 
                  : settings.language === 'hi' 
                  ? 'इसे पूर्ववत नहीं किया जा सकता!' 
                  : 'This action cannot be undone!'}
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {settings.language === 'ar' ? 'إلغاء' : settings.language === 'hi' ? 'रद्द करें' : 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleClearAllData} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {settings.language === 'ar' ? 'نعم، احذف كل شيء' : settings.language === 'hi' ? 'हां, सब कुछ हटाएं' : 'Yes, Delete Everything'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}