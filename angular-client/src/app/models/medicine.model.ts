export interface Medicine {
  id: string;
  appUserId: string;
  name: string;
  dosage?: string;
  frequency: string;
  startDate: string;
  durationDays: number;
  originalDurationDays: number;
  instructions?: string;
  totalPills: number;
  originalTotalPills: number;
  pillsPerDose: number;
  dosesPerDay: number;
  scheduledTime: string;
  taken: boolean;
  reminderActive: boolean;
}

export interface CreateMedicineDto {
  appUserId: string;
  name: string;
  dosage?: string;
  frequency: string;
  startDate: Date;
  durationDays: number;
  originalDurationDays: number;
  instructions?: string;
  totalPills: number;
  originalTotalPills: number;
  pillsPerDose: number;
  dosesPerDay: number;
  scheduledTimes?: string[];
}

export interface UpdateMedicineDto {
  name: string;
  dosage?: string;
  frequency: string;
  startDate: Date;
  durationDays: number;
  originalDurationDays: number;
  totalPills: number;
  originalTotalPills: number;
  pillsPerDose: number;
  dosesPerDay: number;
  instructions?: string;
  scheduledTimes?: string[];
}

export interface MedicineTakenDay {
  id: string;
  medicineId: string;
  date: string;
  taken?: string;
  remindersSent?: string;
}

export interface SetMedicineTakenDayDto {
  date: string;
  taken: string;
}

export interface RefillReminder {
  id: string;
  name: string;
  pillsLeft: number;
  daysLeft: number;
}

export interface Reminder {
  id: string;
  medicineId: string;
  repeatEveryDay: boolean;
  isActive: boolean;
  times: ReminderTime[];
}

export interface ReminderTime {
  id: string;
  time: string;
}

export interface ToggleReminderDto {
  isActive: boolean;
}
