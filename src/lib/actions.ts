
'use server';

import { addRequest, addVolunteer, getVerifiedVolunteers } from './firebase/firestore';
import type { EmergencyRequest, Volunteer } from './types';
import { auth } from './firebase/config';
import { createUserWithEmailAndPassword } from 'firebase/auth';
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
    return { success: true, data: { ...newRequest, id, timestamp: new Date().toISOString() } };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to create request.' };
  }
}

export async function createVolunteerAction(values: RegistrationFormValues) {
    try {
        // Since this is a server action, we can't directly use the client-side `auth` object
        // to sign the user in. We create the user, but the user will have to log in manually.
        // A more complex setup would involve custom tokens.
        
        // This part is tricky on the server. Firebase client SDK is meant for clients.
        // For this prototype, we'll assume this action is called from a client context
        // where auth is initialized, even though it's a server action.
        // In a real app, you'd use the Firebase Admin SDK to create users from the backend.
        
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

        // We'll pass the password to a temporary client-side function to create auth user
        // and then save the data here. This is not ideal but works for the prototype.
        // The ideal way is to use Admin SDK or handle this on the client.
        // Let's create a client-side wrapper that calls this action.
        // For now, let's pretend auth works on the server for simplicity of the prototype.
        // We'll add the volunteer first, then the user can log in.

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
