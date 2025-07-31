
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
  createdAt?: number;
  deviceToken?: string;
}

export interface EmergencyRequest {
  id: string;
  priorityLevel: 'critical' | 'high' | 'medium' | 'low';
  reason: string;
  requestText: string;
  location: string;
  contactPhone: string;
  timestamp: number | string;
  status: 'قيد الانتظار' | 'تم التعيين' | 'تم الحل' | 'تم الإلغاء';
  assignedVolunteer?: string;
  volunteerId?: string;
  eta?: string; // Estimated Time of Arrival
  report?: string; // Report from the volunteer
};
