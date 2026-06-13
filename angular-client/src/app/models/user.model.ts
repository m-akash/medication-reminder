export interface User {
  id: string;
  identityUserId: string;
  name: string;
  email: string;
  lastLogin: string;
  fcmToken?: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
}

export interface UpdateUserDto {
  name: string;
  email: string;
}

export interface SaveFcmTokenDto {
  email: string;
  tokenForNotification: string;
}

export interface NotificationSettings {
  enabled: boolean;
  reminderAdvance: number;
  missedDoseAlerts: boolean;
  refillReminders: boolean;
  dailySummary: boolean;
}

export interface MedicineDefaults {
  defaultDosesPerDay: number;
  defaultReminderTimes: string[];
  defaultDurationDays: number;
}

export interface PrivacySettings {
  dataSharing: boolean;
  analytics: boolean;
}

export interface UserSettings {
  notifications: NotificationSettings;
  medicineDefaults: MedicineDefaults;
  privacy: PrivacySettings;
}

export interface UpdateUserSettingsDto {
  notifications: NotificationSettings;
  medicineDefaults: MedicineDefaults;
  privacy: PrivacySettings;
}
