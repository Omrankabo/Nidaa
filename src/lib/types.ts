import type { PrioritizeEmergencyRequestOutput } from '@/ai/flows/prioritize-emergency-requests';

export interface Volunteer {
  id: string;
  fullName: string;
  gender: 'ذكر' | 'أنثى' | 'آخر';
  region: string;
  city: string;
  profession: string;
  phoneNumber: string;
  status: 'تم التحقق' | 'قيد الانتظار' | 'مرفوض';
}

export type EmergencyRequest = PrioritizeEmergencyRequestOutput & {
  id: string;
  requestText: string;
  timestamp: string;
  status: 'قيد الانتظار' | 'تم التعيين' | 'تم الحل' | 'تم الإلغاء';
  assignedVolunteer?: string;
};
