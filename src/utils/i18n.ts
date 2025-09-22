import type { LanguageStrings } from '@/types';

export const translations: Record<'en' | 'ar', LanguageStrings> = {
  en: {
    appName: 'Parking SMS',
    vehicles: 'Vehicles',
    addVehicle: 'Add Vehicle',
    plateNumber: 'Plate Number',
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
    renewSubscription: 'Renew Subscription'
  },
  ar: {
    appName: 'رسائل الموقف',
    vehicles: 'المركبات',
    addVehicle: 'إضافة مركبة',
    plateNumber: 'رقم اللوحة',
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
    renewSubscription: 'تجديد الاشتراك'
  }
};

export const getTranslations = (language: 'en' | 'ar'): LanguageStrings => {
  return translations[language];
};

export const isRTL = (language: 'en' | 'ar'): boolean => {
  return language === 'ar';
};