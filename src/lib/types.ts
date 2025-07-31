import type { PrioritizeEmergencyRequestOutput } from '@/ai/flows/prioritize-emergency-requests';

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

export type EmergencyRequest = PrioritizeEmergencyRequestOutput & {
  id: string;
  requestText: string;
  location: string;
  contactPhone: string;
  timestamp: string;
  status: 'قيد الانتظار' | 'تم التعيين' | 'تم الحل' | 'تم الإلغاء';
  assignedVolunteer?: string;
  volunteerId?: string;
  eta?: string; // Estimated Time of Arrival
};
