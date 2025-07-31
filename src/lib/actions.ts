
'use server';

import { addRequest, addVolunteer, getVerifiedVolunteers, getAdminDeviceTokens, sendNotificationToVolunteer } from './firebase/firestore';
import type { EmergencyRequest, Volunteer } from './types';
import type { RegistrationFormValues } from '@/app/register/page';


export async function createRequestAction(requestText: string, location: string, contactPhone: string) {
  try {
    const newRequest: Omit<EmergencyRequest, 'id' | 'timestamp'> = {
        priorityLevel: 'medium',
        reason: 'New request, priority not yet triaged by admin.',
        requestText,
        location,
        contactPhone,
        status: 'قيد الانتظار',
    };

    const id = await addRequest(newRequest);

    // Send notification to admins
    const adminTokens = await getAdminDeviceTokens();
    const notificationPromises = adminTokens.map(token => 
      sendNotificationToVolunteer(token, 'طلب طوارئ جديد', `تم استلام طلب جديد في ${location}`)
    );
    await Promise.all(notificationPromises);


    return { success: true, data: { ...newRequest, id, timestamp: new Date().toISOString() } };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to create request.' };
  }
}

export async function createVolunteerAction(values: RegistrationFormValues) {
    try {
        const volunteerData: Omit<Volunteer, 'id'> = {
            fullName: values.fullName,
            email: values.email,
            gender: values.gender === 'male' ? 'ذكر' : 'أنثى',
            region: values.region,
            city: values.city,
            profession: values.profession,
            phoneNumber: values.phoneNumber,
            status: 'قيد الانتظار',
            createdAt: Date.now()
        };

        await addVolunteer(values.email, volunteerData);

        return { success: true };

    } catch (error: any) {
        console.error("Registration error in server action:", error);
        return { success: false, error: error.message || 'An unknown error occurred' };
    }
}


export async function findAndAssignVolunteer(request: EmergencyRequest) {
    try {
        const volunteers = await getVerifiedVolunteers();
        // Match by region first
        const region = request.location.split(',')[0].trim();
        let matchedVolunteer = volunteers.find(v => v.region === region);
        
        if (!matchedVolunteer) {
             // Fallback to city if no region match
            const city = request.location.split(',')[1]?.trim();
            if(city) {
                matchedVolunteer = volunteers.find(v => v.city === city);
            }
        }

        if(matchedVolunteer) {
            await sendNotificationToVolunteer(matchedVolunteer.id, 'تم تعيين طلب جديد لك', `لقد تم تعيينك لطلب طوارئ في ${request.location}`);
            return { success: true, volunteer: matchedVolunteer };
        } else {
            // Fallback to any available volunteer if no location match
            const anyVolunteer = volunteers[0];
            if (anyVolunteer) {
                 await sendNotificationToVolunteer(anyVolunteer.id, 'تم تعيين طلب جديد لك', `لقد تم تعيينك لطلب طوارئ في ${request.location}`);
                return { success: true, volunteer: anyVolunteer };
            }
            return { success: false, error: 'لا يوجد متطوعون معتمدون متاحون حاليًا.' };
        }

    } catch (error) {
        console.error("Error finding volunteer:", error);
        return { success: false, error: 'حدث خطأ أثناء محاولة العثور على متطوع.' };
    }
}
