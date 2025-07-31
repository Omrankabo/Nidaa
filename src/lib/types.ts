import type { PrioritizeEmergencyRequestOutput } from '@/ai/flows/prioritize-emergency-requests';

export interface Volunteer {
  id: string;
  fullName: string;
  gender: 'Male' | 'Female' | 'Other';
  region: string;
  city: string;
  profession: string;
  phoneNumber: string;
  status: 'Verified' | 'Pending' | 'Rejected';
}

export type EmergencyRequest = PrioritizeEmergencyRequestOutput & {
  id: string;
  requestText: string;
  timestamp: string;
  status: 'Pending' | 'Assigned' | 'Resolved' | 'Cancelled';
  assignedVolunteer?: string;
};
