export interface Vehicle {
  id: string;
  plateNumber: string;
  smsMessage: string;
  status: 'pending' | 'sent' | 'failed' | 'verified';
  lastSent?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SMSStatus {
  vehicleId: string;
  status: 'sending' | 'sent' | 'failed' | 'verified';
  message?: string;
  sentAt?: Date;
  verifiedAt?: Date;
}

export interface AppSettings {
  language: 'en' | 'ar';
  governmentNumber: string;
  autoSendTime?: string;
  notificationsEnabled: boolean;
}

export interface SubscriptionStatus {
  isActive: boolean;
  type: 'google_play' | 'activation_code' | 'trial';
  expiresAt?: Date;
  activationCode?: string;
}

export interface LanguageStrings {
  appName: string;
  vehicles: string;
  addVehicle: string;
  plateNumber: string;
  smsMessage: string;
  sendAll: string;
  status: string;
  sent: string;
  failed: string;
  pending: string;
  verified: string;
  settings: string;
  subscription: string;
  activationCode: string;
  enterCode: string;
  activate: string;
  subscriptionExpired: string;
  renewSubscription: string;
}