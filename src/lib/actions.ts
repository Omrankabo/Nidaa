
'use server';

import { addRequest, addVolunteer, getVerifiedVolunteers, getAdminDeviceTokens, sendNotificationToVolunteer } from './firebase/firestore';
import type { EmergencyRequest, Volunteer } from './types';
import type { RegistrationFormValues } from '@/app/register/page';


export async function createRequestAction(requestText: string, location: string, contactPhone: string) {
  try {
    const newRequest: Omit<EmergencyRequest, 'id' | 'timestamp'> = {
        priorityLevel: 'متوسطة',
        reason: 'طلب جديد، لسه ما اتصنف من المدير.',
        requestText,
        location,
        contactPhone,
        status: 'في الانتظار',
    };

    const id = await addRequest(newRequest);

    // This is a placeholder for getting admin tokens. In a real app, you'd have a roles system.
    // For now, we will assume a generic 'admin_user' to get tokens.
    const adminTokens = await getAdminDeviceTokens('admin_user'); 
    const notificationPromises = adminTokens.map(token => 
      // The first argument to sendNotificationToVolunteer should be the target.
      // Since we already have the tokens, we can pass them directly.
      sendNotificationToVolunteer(token, 'طلب طوارئ جديد', `جاكم طلب جديد في ${location}`)
    );
    await Promise.all(notificationPromises);


    return { success: true, data: { ...newRequest, id, timestamp: new Date().toISOString() } };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'ما قدرنا ننشئ الطلب.' };
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
        return { success: false, error: error.message || 'حصل خطأ غريب' };
    }
}


export async function findAndAssignVolunteer(request: EmergencyRequest) {
    try {
        const volunteers = await getVerifiedVolunteers();
        const availableVolunteers = volunteers.filter(v => v.id !== request.volunteerId); // Exclude currently assigned
        
        const region = request.location.split(',')[0].trim();
        let matchedVolunteer = availableVolunteers.find(v => v.region === region);
        
        if (!matchedVolunteer) {
            matchedVolunteer = availableVolunteers[0];
        }

        if(matchedVolunteer) {
            // A volunteer's device tokens are stored under their ID (the safe email key)
            const volunteerTokens = await getAdminDeviceTokens(matchedVolunteer.id);
            const notificationPromises = volunteerTokens.map(token => 
                sendNotificationToVolunteer(token, 'جاك طلب جديد', `تم تعيينك لطلب طوارئ في ${request.location}`)
            );
            await Promise.all(notificationPromises);
            return { success: true, volunteer: matchedVolunteer };
        } else {
            return { success: false, error: 'مافي أي متطوع معتمد وجاهز حالياً.' };
        }

    } catch (error) {
        console.error("Error finding volunteer:", error);
        return { success: false, error: 'حصل خطأ وإحنا بنفتش ليك في متطوع.' };
    }
}
