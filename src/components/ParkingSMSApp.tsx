import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VehicleCard } from '@/components/VehicleCard';
import { AddVehicleDialog } from '@/components/AddVehicleDialog';
import { SMSStatusSheet } from '@/components/SMSStatusSheet';
import { SubscriptionCard } from '@/components/SubscriptionCard';
import { Car, Send, Settings, Crown, Globe, MessageSquare } from 'lucide-react';
import { LocalStorage } from '@/utils/storage';
import { getTranslations, isRTL } from '@/utils/i18n';
import { useToast } from '@/hooks/use-toast';
import type { Vehicle, AppSettings, SubscriptionStatus } from '@/types';

export function ParkingSMSApp() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    language: 'en',
    governmentNumber: '3009',
    notificationsEnabled: true
  });
  const [subscription, setSubscription] = useState<SubscriptionStatus>({
    isActive: true,
    type: 'trial',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });
  const [smsSheetOpen, setSmsSheetOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const { toast } = useToast();
  const translations = getTranslations(settings.language);
  const rtl = isRTL(settings.language);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [vehiclesData, settingsData, subscriptionData] = await Promise.all([
          LocalStorage.getVehicles(),
          LocalStorage.getSettings(),
          LocalStorage.getSubscriptionStatus()
        ]);
        
        setVehicles(vehiclesData);
        setSettings(settingsData);
        setSubscription(subscriptionData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const handleAddVehicle = async (vehicleData: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newVehicle: Vehicle = {
      ...vehicleData,
      id: Date.now().toString(),
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
    const updatedVehicles = vehicles.map(v => 
      v.id === id 
        ? { ...v, ...updates, updatedAt: new Date(), lastSent: updates.status === 'sent' ? new Date() : v.lastSent }
        : v
    );
    
    setVehicles(updatedVehicles);
    await LocalStorage.saveVehicles(updatedVehicles);
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

  const handleLanguageSwitch = async () => {
    const newLanguage: 'en' | 'ar' = settings.language === 'en' ? 'ar' : 'en';
    const newSettings = { ...settings, language: newLanguage };
    setSettings(newSettings);
    await LocalStorage.saveSettings(newSettings);
  };

  const handleSubscriptionUpdate = async (newSubscription: SubscriptionStatus) => {
    setSubscription(newSubscription);
    await LocalStorage.saveSubscriptionStatus(newSubscription);
    
    toast({
      title: "Subscription Updated",
      description: "Your subscription has been activated successfully."
    });
  };

  const handleSMSStatusUpdate = async (vehicleId: string, status: Vehicle['status']) => {
    await handleUpdateVehicle(vehicleId, { status });
  };

  // Check subscription status
  const isSubscriptionExpired = subscription.expiresAt && new Date() > new Date(subscription.expiresAt);
  const canUsePremiumFeatures = subscription.isActive && !isSubscriptionExpired;

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
      className={`mobile-container min-h-screen bg-background ${rtl ? 'text-right' : 'text-left'}`}
      dir={rtl ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-40 py-4">
        <div className={`flex items-center justify-between ${rtl ? 'flex-row-reverse' : ''}`}>
          <div className={`flex items-center gap-3 ${rtl ? 'flex-row-reverse' : ''}`}>
            <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Car className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">{translations.appName}</h1>
              <p className="text-sm text-muted-foreground">
                {vehicles.length} vehicles / {vehicles.length} مركبة
              </p>
            </div>
          </div>
          
          <div className={`flex items-center gap-2 ${rtl ? 'flex-row-reverse' : ''}`}>
            <Button
              onClick={handleLanguageSwitch}
              variant="outline"
              size="icon"
              className="h-10 w-10"
            >
              <Globe className="h-4 w-4" />
            </Button>
            {!canUsePremiumFeatures && (
              <Badge variant="destructive" className="text-xs">
                Expired
              </Badge>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20 pt-4">
        <Tabs defaultValue="vehicles" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="vehicles" className="flex items-center gap-2">
              <Car className="h-4 w-4" />
              {translations.vehicles}
            </TabsTrigger>
            <TabsTrigger value="sms" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              SMS
            </TabsTrigger>
            <TabsTrigger value="subscription" className="flex items-center gap-2">
              <Crown className="h-4 w-4" />
              {translations.subscription}
            </TabsTrigger>
          </TabsList>

          {/* Vehicles Tab */}
          <TabsContent value="vehicles" className="space-y-4">
            <div className={`flex items-center justify-between ${rtl ? 'flex-row-reverse' : ''}`}>
              <h2 className="text-lg font-semibold">{translations.vehicles}</h2>
              <Badge variant="secondary">
                {vehicles.length} vehicles
              </Badge>
            </div>
            
            <AddVehicleDialog onAdd={handleAddVehicle} isRTL={rtl} />
            
            {vehicles.length === 0 ? (
              <Card className="card-mobile text-center py-8">
                <Car className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-semibold mb-2">No vehicles added yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Add your first vehicle to start sending parking SMS messages
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {vehicles.map(vehicle => (
                  <VehicleCard
                    key={vehicle.id}
                    vehicle={vehicle}
                    onUpdate={handleUpdateVehicle}
                    onDelete={handleDeleteVehicle}
                    isRTL={rtl}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* SMS Tab */}
          <TabsContent value="sms" className="space-y-4">
            <div className={`flex items-center justify-between ${rtl ? 'flex-row-reverse' : ''}`}>
              <h2 className="text-lg font-semibold">SMS Status</h2>
              <Badge variant="secondary">
                {pendingCount} pending
              </Badge>
            </div>
            
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
            
            <Button
              onClick={() => setSmsSheetOpen(true)}
              variant="mobile"
              size="mobile"
              className="w-full"
              disabled={!canUsePremiumFeatures || vehicles.length === 0}
            >
              <Send className="h-5 w-5" />
              {translations.sendAll} ({pendingCount})
            </Button>
            
            {!canUsePremiumFeatures && (
              <Card className="card-mobile border-warning/20 bg-warning/5">
                <div className="text-center space-y-2">
                  <Crown className="h-8 w-8 text-warning mx-auto" />
                  <h3 className="font-semibold">{translations.subscriptionExpired}</h3>
                  <p className="text-sm text-muted-foreground">
                    Activate your subscription to send SMS messages
                  </p>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription" className="space-y-4">
            <div className={`flex items-center justify-between ${rtl ? 'flex-row-reverse' : ''}`}>
              <h2 className="text-lg font-semibold">{translations.subscription}</h2>
            </div>
            
            <SubscriptionCard
              subscription={subscription}
              onUpdate={handleSubscriptionUpdate}
              isRTL={rtl}
            />
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
    </div>
  );
}