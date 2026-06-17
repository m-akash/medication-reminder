export interface User {
  id: string;
  identityUserId: string;
  name: string;
  email: string;
  lastLogin: string;
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

export interface NotificationSettings {
  enabled: boolean;
  missedDoseAlerts: boolean;
  refillReminders: boolean;
  dailySummary: boolean;
}

export interface MedicineDefaults {
  defaultReminderTimes: string[];
}

export interface PrivacySettings {
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
