export interface Vehicle {
  id: string;
  plateNumber: string;
  roomName: string; // Flat/room identifier
  smsMessage: string;
  status: 'pending' | 'sent' | 'failed' | 'verified';
  lastSent?: Date;
  createdAt: Date;
  updatedAt: Date;
  villaId: string; // Reference to villa group
  serialNumber: number; // Auto-generated serial number
}

export interface SMSStatus {
  vehicleId: string;
  status: 'sending' | 'sent' | 'failed' | 'verified';
  message?: string;
  sentAt?: Date;
  verifiedAt?: Date;
}

export interface Villa {
  id: string;
  name: string;
  defaultSmsNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AutomationSchedule {
  id: string;
  villaId: string;
  enabled: boolean;
  time: string; // Format: "HH:mm"
  daysOfWeek: boolean[]; // [Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday]
  lastRun?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationReminder {
  id: string;
  villaId: string;
  time: string; // Format: "HH:mm"
  enabled: boolean;
  message: string;
  createdAt: Date;
}

export interface AppSettings {
  language: 'en' | 'ar';
  defaultSmsNumber: string; // Global default
  notificationsEnabled: boolean;
  automationEnabled: boolean;
}

export interface SubscriptionStatus {
  isActive: boolean;
  type: 'google_play' | 'activation_code' | 'trial';
  expiresAt?: Date;
  activationCode?: string;
  villaLimit?: number; // Maximum number of villas allowed
}

export const MAX_VEHICLES_PER_VILLA = 20; // Maximum vehicles per villa

export interface SMSPreflightCheck {
  vehicleId: string;
  selected: boolean;
  vehicle: Vehicle;
}

export interface LanguageStrings {
  appName: string;
  vehicles: string;
  addVehicle: string;
  plateNumber: string;
  roomName: string;
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
  villa: string;
  villas: string;
  addVilla: string;
  automation: string;
  schedule: string;
  notifications: string;
  defaultNumber: string;
  serialNumber: string;
  smsHistory: string;
  last7Days: string;
  date: string;
  successful: string;
  errors: string;
}

export interface SMSHistoryEntry {
  date: string; // Format: "YYYY-MM-DD"
  successful: number;
  errors: number;
}