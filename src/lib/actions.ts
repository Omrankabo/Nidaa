
'use server';

import { addRequest, addVolunteer, getVerifiedVolunteers, getAdminDeviceTokens, sendNotificationToVolunteer } from './firebase/firestore';
import type { EmergencyRequest, Volunteer } from './types';
import type { RegistrationFormValues } from '@/app/register/page';

/**
 * Server Action to create a new emergency request.
 * This function is called from the client-side form.
 * It adds the request to the database and sends a notification to admins.
 * @param {string} requestText - The main description of the emergency.
 * @param {string} location - The location of the emergency.
 * @param {string} contactPhone - A contact phone number.
 * @returns {Promise<{success: boolean, data?: any, error?: string}>} An object indicating success or failure.
 */
export async function createRequestAction(requestText: string, location: string, contactPhone: string) {
  try {
    const newRequest: Omit<EmergencyRequest, 'id' | 'timestamp'> = {
        priorityLevel: 'متوسطة', // Default priority
        reason: 'طلب جديد، لسه ما اتصنف من المدير.',
        requestText,
        location,
        contactPhone,
        status: 'في الانتظار', // Initial status
    };

    // Add the request to the Firebase Realtime Database.
    const id = await addRequest(newRequest);

    // Get all device tokens for admin users to send notifications.
    const adminTokens = await getAdminDeviceTokens('admin_user'); 
    
    // Send a notification to each admin device.
    const notificationPromises = adminTokens.map(token => 
      sendNotificationToVolunteer(token, 'طلب طوارئ جديد', `جاكم طلب جديد في ${location}`)
    );
    await Promise.all(notificationPromises);


    return { success: true, data: { ...newRequest, id, timestamp: new Date().toISOString() } };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'ما قدرنا ننشئ الطلب.' };
  }
}

/**
 * Server Action to create a new volunteer.
 * This is called from the registration form.
 * It adds a new volunteer document to the database with a 'pending' status.
 * @param {RegistrationFormValues} values - The registration form data.
 * @returns {Promise<{success: boolean, error?: string}>} An object indicating success or failure.
 */
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
            status: 'قيد الانتظار', // Initial status for new volunteers
            createdAt: Date.now()
        };
        
        // Add the volunteer to the database, using their email as the key.
        await addVolunteer(values.email, volunteerData);

        return { success: true };

    } catch (error: any) {
        console.error("Registration error in server action:", error);
        return { success: false, error: error.message || 'حصل خطأ غريب' };
    }
}

/**
 * Server Action to find an available volunteer and assign them to a request.
 * This function is intended to be called by an admin.
 * @param {EmergencyRequest} request - The request that needs a volunteer.
 * @returns {Promise<{success: boolean, volunteer?: Volunteer, error?: string}>} An object indicating success and the matched volunteer, or failure.
 */
export async function findAndAssignVolunteer(request: EmergencyRequest) {
    try {
        // Get all verified volunteers from the database.
        const volunteers = await getVerifiedVolunteers();
        // Exclude any volunteer already assigned to this request.
        const availableVolunteers = volunteers.filter(v => v.id !== request.volunteerId); 
        
        const region = request.location.split(',')[0].trim();
        // Attempt to find a volunteer in the same region as the request.
        let matchedVolunteer = availableVolunteers.find(v => v.region === region);
        
        // If no volunteer is found in the same region, assign the first available one as a fallback.
        if (!matchedVolunteer) {
            matchedVolunteer = availableVolunteers[0];
        }

        if(matchedVolunteer) {
            // Get the matched volunteer's device tokens to send a notification.
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
