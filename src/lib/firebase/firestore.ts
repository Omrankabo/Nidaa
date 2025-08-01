
import {
  ref,
  set,
  push,
  onValue,
  query,
  orderByChild,
  equalTo,
  get,
  update,
  remove,
  serverTimestamp,
} from "firebase/database";
import { db } from "./config";
import type { EmergencyRequest, Volunteer } from "../types";

const REQUESTS_PATH = "requests";
const VOLUNTEERS_PATH = "volunteers";
const NOTIFICATIONS_PATH = "notifications"; // For sending notifications via DB trigger

// Requests
export async function addRequest(request: Omit<EmergencyRequest, 'id' | 'timestamp'>): Promise<string> {
  const requestsRef = ref(db, REQUESTS_PATH);
  const newRequestRef = push(requestsRef);
  await set(newRequestRef, {
      ...request,
      timestamp: serverTimestamp()
  });
  return newRequestRef.key!;
}

export function getRequests(
    callback: (requests: EmergencyRequest[]) => void, 
    setLoading?: (loading: boolean) => void
) {
    const requestsRef = query(ref(db, REQUESTS_PATH), orderByChild('timestamp'));
    const unsubscribe = onValue(requestsRef, (snapshot) => {
        const requestsData = snapshot.val();
        if (requestsData) {
            const requests = Object.keys(requestsData).map(key => ({
                id: key,
                ...requestsData[key],
                timestamp: new Date(requestsData[key].timestamp).toISOString()
            })).reverse();
            callback(requests);
        } else {
            callback([]);
        }
        if (setLoading) setLoading(false);
    }, (error) => {
        console.error("Error fetching requests:", error);
        if (setLoading) setLoading(false);
    });
    return unsubscribe;
}

export async function getRequestById(id: string, callback: (request: EmergencyRequest | null) => void) {
  const requestRef = ref(db, `${REQUESTS_PATH}/${id}`);
  const unsubscribe = onValue(requestRef, (snapshot) => {
    if (snapshot.exists()) {
        const data = snapshot.val();
        callback({ id: snapshot.key!, ...data, timestamp: new Date(data.timestamp).toISOString() });
    } else {
        callback(null);
    }
  }, (error) => {
      console.error("Error fetching request:", error);
  });
  return unsubscribe;
}


export async function updateRequest(id: string, data: Partial<EmergencyRequest>) {
    const requestRef = ref(db, `${REQUESTS_PATH}/${id}`);
    await update(requestRef, data);
}

export async function deleteRequest(id: string) {
    const requestRef = ref(db, `${REQUESTS_PATH}/${id}`);
    await remove(requestRef);
}

export async function updateRequestStatus(id: string, status: EmergencyRequest['status']) {
    await updateRequest(id, { status });
}


// Volunteers

export async function addVolunteer(email: string, volunteer: Omit<Volunteer, 'id'>) {
    // Use email as key since we removed firebase auth UIDs
    const safeEmailKey = email.replace(/[.#$[\]]/g, "_");
    const volunteersRef = ref(db, `${VOLUNTEERS_PATH}/${safeEmailKey}`);
    await set(volunteersRef, volunteer);
}


export function getVolunteers(
    callback: (volunteers: Volunteer[]) => void,
    setLoading?: (loading: boolean) => void
) {
    const volunteersRef = query(ref(db, VOLUNTEERS_PATH), orderByChild('createdAt'));
    const unsubscribe = onValue(volunteersRef, (snapshot) => {
        const volunteersData = snapshot.val();
        if (volunteersData) {
            const volunteers = Object.keys(volunteersData).map(key => ({
                id: key,
                ...volunteersData[key]
            })).reverse();
            callback(volunteers);
        } else {
            callback([]);
        }
        if (setLoading) setLoading(false);
    }, (error) => {
        console.error("Error fetching volunteers:", error);
        if (setLoading) setLoading(false);
    });
    return unsubscribe;
}


export async function getVerifiedVolunteers(): Promise<Volunteer[]> {
    const volunteersRef = query(ref(db, VOLUNTEERS_PATH), orderByChild("status"), equalTo("تم التحقق"));
    const snapshot = await get(volunteersRef);
    if (snapshot.exists()) {
        const volunteersData = snapshot.val();
        return Object.keys(volunteersData).map(key => ({ id: key, ...volunteersData[key] }));
    }
    return [];
}

export async function getVolunteerByEmail(email: string): Promise<Volunteer | null> {
    const safeEmailKey = email.replace(/[.#$[\]]/g, "_");
    const volunteerRef = ref(db, `${VOLUNTEERS_PATH}/${safeEmailKey}`);
    const snapshot = await get(volunteerRef);
    if (snapshot.exists()) {
        return { id: snapshot.key, ...snapshot.val() };
    }
    return null;
}

export async function updateVolunteerStatus(id: string, status: Volunteer['status']) {
    const volunteerRef = ref(db, `${VOLUNTEERS_PATH}/${id}`);
    await update(volunteerRef, { status });
}

export async function deleteVolunteer(id: string) {
    const volunteerRef = ref(db, `${VOLUNTEERS_PATH}/${id}`);
    await remove(volunteerRef);
}

// Volunteer Dashboard
export function getVolunteerRequests(
    volunteerId: string,
    callback: (assigned: EmergencyRequest[], history: EmergencyRequest[]) => void
) {
    const requestsRef = query(ref(db, REQUESTS_PATH), orderByChild('volunteerId'), equalTo(volunteerId));
    const unsubscribe = onValue(requestsRef, (snapshot) => {
        const allRequests: EmergencyRequest[] = [];
        if (snapshot.exists()) {
            const requestsData = snapshot.val();
            Object.keys(requestsData).forEach(key => {
                 const request = requestsData[key];
                 allRequests.push({
                     id: key,
                     ...request,
                     timestamp: new Date(request.timestamp).toISOString()
                 });
            });
        }
        const assigned = allRequests.filter(r => r.status === 'تم التعيين').reverse();
        const history = allRequests.filter(r => r.status !== 'تم التعيين').reverse();
        callback(assigned, history);
    }, (error) => {
        console.error("Error fetching volunteer requests:", error);
    });
    return unsubscribe;
}

export function getVolunteerById(volunteerId: string, callback: (volunteer: Volunteer | null) => void) {
    const volunteerRef = ref(db, `${VOLUNTEERS_PATH}/${volunteerId}`);
    return onValue(volunteerRef, (snapshot) => {
        if (snapshot.exists()) {
            callback({ id: snapshot.key!, ...snapshot.val() });
        } else {
            callback(null);
        }
    });
}

export async function updateVolunteerProfile(id: string, data: Partial<Pick<Volunteer, 'profession' | 'region'>>) {
    const volunteerRef = ref(db, `${VOLUNTEERS_PATH}/${id}`);
    await update(volunteerRef, data);
}

// Notifications
export async function saveDeviceToken(userId: string, token: string) {
    // The userId here is the safe email key
    const tokenRef = ref(db, `device_tokens/${userId}/${token}`);
    await set(tokenRef, true);
}

export async function getAdminDeviceTokens(userId: string): Promise<string[]> {
    const tokensRef = ref(db, `device_tokens/${userId}`);
    const snapshot = await get(tokensRef);
    if(snapshot.exists()) {
        return Object.keys(snapshot.val());
    }
    return [];
}

export async function sendNotificationToVolunteer(targetIdOrToken: string, title: string, body: string) {
    // This function will write to a 'notifications' queue in RTDB.
    // A Cloud Function would listen to this queue and send the actual push notification.
    const notificationsRef = ref(db, NOTIFICATIONS_PATH);
    const newNotificationRef = push(notificationsRef);
    await set(newNotificationRef, {
        target: targetIdOrToken, // Can be a userId (safe email key) or a specific token
        title,
        body,
        createdAt: serverTimestamp()
    });
}
