'use server';

import { addRequest, getVerifiedVolunteers } from './firebase/firestore';
import type { EmergencyRequest } from './types';

export async function createRequestAction(requestText: string, location: string, contactPhone: string) {
  try {
    const newRequest: Omit<EmergencyRequest, 'id'> = {
        priorityLevel: 'medium', // Default priority
        reason: 'New request, priority not yet triaged by admin.', // Default reason
        requestText,
        location,
        contactPhone,
        timestamp: new Date().toISOString(),
        status: 'قيد الانتظار',
    };

    const id = await addRequest(newRequest);
    return { success: true, data: { ...newRequest, id } };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to create request.' };
  }
}

export async function findAndAssignVolunteer(request: EmergencyRequest) {
    try {
        const volunteers = await getVerifiedVolunteers();
        // This is a simple matching logic. A real-world app would have a more complex algorithm
        // considering location, profession, availability, etc.
        const matchedVolunteer = volunteers.find(v => v.city === request.location.split(',')[0].trim());
        
        if(matchedVolunteer) {
            return { success: true, volunteer: matchedVolunteer };
        } else {
            // Fallback to any available volunteer if no location match
            const anyVolunteer = volunteers[0];
            if (anyVolunteer) {
                return { success: true, volunteer: anyVolunteer };
            }
            return { success: false, error: 'لا يوجد متطوعون معتمدون متاحون حاليًا.' };
        }

    } catch (error) {
        console.error("Error finding volunteer:", error);
        return { success: false, error: 'حدث خطأ أثناء محاولة العثور على متطوع.' };
    }
}
