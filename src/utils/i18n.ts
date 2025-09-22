import type { LanguageStrings } from '@/types';

export const translations: Record<'en' | 'ar', LanguageStrings> = {
  en: {
    appName: 'Parking SMS',
    vehicles: 'Vehicles',
    addVehicle: 'Add Vehicle',
    plateNumber: 'Plate Number',
    roomName: 'Room/Flat',
    smsMessage: 'SMS Message',
    sendAll: 'Send All SMS',
    status: 'Status',
    sent: 'Sent',
    failed: 'Failed',
    pending: 'Pending',
    verified: 'Verified',
    settings: 'Settings',
    subscription: 'Subscription',
    activationCode: 'Activation Code',
    enterCode: 'Enter Activation Code',
    activate: 'Activate',
    subscriptionExpired: 'Subscription Expired',
    renewSubscription: 'Renew Subscription',
    villa: 'Villa',
    villas: 'Villas',
    addVilla: 'Add Villa',
    automation: 'Automation',
    schedule: 'Schedule',
    notifications: 'Notifications',
    defaultNumber: 'Default Number',
    serialNumber: 'S/N'
  },
  ar: {
    appName: 'رسائل الموقف',
    vehicles: 'المركبات',
    addVehicle: 'إضافة مركبة',
    plateNumber: 'رقم اللوحة',
    roomName: 'الغرفة/الشقة',
    smsMessage: 'رسالة SMS',
    sendAll: 'إرسال جميع الرسائل',
    status: 'الحالة',
    sent: 'مُرسل',
    failed: 'فشل',
    pending: 'في الانتظار',
    verified: 'مُتحقق',
    settings: 'الإعدادات',
    subscription: 'الاشتراك',
    activationCode: 'رمز التفعيل',
    enterCode: 'أدخل رمز التفعيل',
    activate: 'تفعيل',
    subscriptionExpired: 'انتهت صلاحية الاشتراك',
    renewSubscription: 'تجديد الاشتراك',
    villa: 'الفيلا',
    villas: 'الفيلات',
    addVilla: 'إضافة فيلا',
    automation: 'الأتمتة',
    schedule: 'الجدولة',
    notifications: 'التنبيهات',
    defaultNumber: 'الرقم الافتراضي',
    serialNumber: 'الرقم التسلسلي'
  }
};

export const getTranslations = (language: 'en' | 'ar'): LanguageStrings => {
  return translations[language];
};

export const isRTL = (language: 'en' | 'ar'): boolean => {
  return language === 'ar';
};