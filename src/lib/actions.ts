'use server';

import { prioritizeEmergencyRequest } from '@/ai/flows/prioritize-emergency-requests';

export async function prioritizeRequestAction(requestText: string) {
  try {
    const result = await prioritizeEmergencyRequest({ requestText });
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'فشل تحديد أولوية الطلب.' };
  }
}
