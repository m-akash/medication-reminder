export interface Notification {
  id: string;
  appUserId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  medicineId?: string;
  medicineName?: string;
}
