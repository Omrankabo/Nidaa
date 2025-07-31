import type { Timestamp } from "firebase/firestore";

export interface Volunteer {
  id: string;
  fullName: string;
  email: string;
  gender: 'ذكر' | 'أنثى' | 'آخر';
  region: string;
  city: string;
  profession: string;
  phoneNumber: string;
  status: 'تم التحقق' | 'قيد الانتظار' | 'مرفوض';
  photoIdUrl?: string; // URL to the uploaded ID photo
}

export interface EmergencyRequest {
  id: string;
  priorityLevel: 'critical' | 'high' | 'medium' | 'low';
  reason: string;
  requestText: string;
  location: string;
  contactPhone: string;
  timestamp: string | Timestamp;
  status: 'قيد الانتظار' | 'تم التعيين' | 'تم الحل' | 'تم الإلغاء';
  assignedVolunteer?: string;
  volunteerId?: string;
  eta?: string; // Estimated Time of Arrival
};
