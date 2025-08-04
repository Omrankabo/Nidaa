
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

// Defines the paths for different data collections in the Realtime Database.
const REQUESTS_PATH = "requests";
const VOLUNTEERS_PATH = "volunteers";
const NOTIFICATIONS_PATH = "notifications";
const DEVICE_TOKENS_PATH = "device_tokens";

// --- Emergency Request Functions ---

/**
 * Adds a new emergency request to the database.
 * @param {Omit<EmergencyRequest, 'id' | 'timestamp'>} request - The request object without id and timestamp.
 * @returns {Promise<string>} The unique key (ID) of the newly created request.
 */
export async function addRequest(request: Omit<EmergencyRequest, 'id' | 'timestamp'>): Promise<string> {
  const requestsRef = ref(db, REQUESTS_PATH);
  const newRequestRef = push(requestsRef);
  await set(newRequestRef, {
      ...request,
      timestamp: serverTimestamp() // Use server-side timestamp for accuracy.
  });
  return newRequestRef.key!;
}

/**
 * Subscribes to real-time updates for all emergency requests.
 * @param {(requests: EmergencyRequest[]) => void} callback - Function to call with the list of requests.
 * @param {(loading: boolean) => void} [setLoading] - Optional function to update loading state.
 * @returns {() => void} An unsubscribe function to detach the listener.
 */
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
            })).reverse(); // Show newest requests first.
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

/**
 * Subscribes to real-time updates for a single emergency request by its ID.
 * @param {string} id - The ID of the request.
 * @param {(request: EmergencyRequest | null) => void} callback - Function to call with the request data or null if not found.
 * @returns {() => void} An unsubscribe function.
 */
export function getRequestById(id: string, callback: (request: EmergencyRequest | null) => void) {
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

/**
 * Updates specific fields of an existing emergency request.
 * @param {string} id - The ID of the request to update.
 * @param {Partial<EmergencyRequest>} data - An object with the fields to update.
 */
export async function updateRequest(id: string, data: Partial<EmergencyRequest>) {
    const requestRef = ref(db, `${REQUESTS_PATH}/${id}`);
    await update(requestRef, data);
}

/**
 * Deletes an emergency request from the database.
 * @param {string} id - The ID of the request to delete.
 */
export async function deleteRequest(id: string) {
    const requestRef = ref(db, `${REQUESTS_PATH}/${id}`);
    await remove(requestRef);
}

// --- Volunteer Functions ---

/**
 * Adds a new volunteer to the database. The ID is a sanitized version of the email.
 * @param {string} email - The volunteer's email address.
 * @param {Omit<Volunteer, 'id'>} volunteer - The volunteer's data.
 */
export async function addVolunteer(email: string, volunteer: Omit<Volunteer, 'id'>) {
    // Sanitize the email to use it as a Firebase key.
    const safeEmailKey = email.replace(/[.#$[\]]/g, "_");
    const volunteersRef = ref(db, `${VOLUNTEERS_PATH}/${safeEmailKey}`);
    await set(volunteersRef, volunteer);
}

/**
 * Subscribes to real-time updates for all volunteers.
 * @param {(volunteers: Volunteer[]) => void} callback - Function to call with the list of volunteers.
 * @param {(loading: boolean) => void} [setLoading] - Optional function to update loading state.
 * @returns {() => void} An unsubscribe function.
 */
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
            })).reverse(); // Show newest volunteers first.
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

/**
 * Fetches a list of all volunteers with a 'verified' status.
 * @returns {Promise<Volunteer[]>} A promise that resolves to an array of verified volunteers.
 */
export async function getVerifiedVolunteers(): Promise<Volunteer[]> {
    const volunteersRef = query(ref(db, VOLUNTEERS_PATH), orderByChild("status"), equalTo("تم التحقق"));
    const snapshot = await get(volunteersRef);
    if (snapshot.exists()) {
        const volunteersData = snapshot.val();
        return Object.keys(volunteersData).map(key => ({ id: key, ...volunteersData[key] }));
    }
    return [];
}

/**
 * Fetches a single volunteer's data by their email address.
 * @param {string} email - The email of the volunteer to fetch.
 * @returns {Promise<Volunteer | null>} A promise resolving to the volunteer data or null.
 */
export async function getVolunteerByEmail(email: string): Promise<Volunteer | null> {
    const safeEmailKey = email.replace(/[.#$[\]]/g, "_");
    const volunteerRef = ref(db, `${VOLUNTEERS_PATH}/${safeEmailKey}`);
    const snapshot = await get(volunteerRef);
    if (snapshot.exists()) {
        return { id: snapshot.key, ...snapshot.val() };
    }
    return null;
}

/**
 * Updates the status of a volunteer (e.g., to 'verified' or 'rejected').
 * @param {string} id - The sanitized email ID of the volunteer.
 * @param {Volunteer['status']} status - The new status.
 */
export async function updateVolunteerStatus(id: string, status: Volunteer['status']) {
    const volunteerRef = ref(db, `${VOLUNTEERS_PATH}/${id}`);
    await update(volunteerRef, { status });
}

/**
 * Deletes a volunteer from the database.
 * @param {string} id - The sanitized email ID of the volunteer to delete.
 */
export async function deleteVolunteer(id: string) {
    const volunteerRef = ref(db, `${VOLUNTEERS_PATH}/${id}`);
    await remove(volunteerRef);
}

// --- Volunteer Dashboard Specific Functions ---

/**
 * Subscribes to requests specifically assigned to a single volunteer.
 * @param {string} volunteerId - The ID of the volunteer.
 * @param {(assigned: EmergencyRequest[], history: EmergencyRequest[]) => void} callback - Function to call with assigned and historical requests.
 * @returns {() => void} An unsubscribe function.
 */
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
        // Separate requests into currently assigned vs historical.
        const assigned = allRequests.filter(r => r.status === 'تم التعيين' || r.status === 'قيد التنفيذ').reverse();
        const history = allRequests.filter(r => r.status !== 'تم التعيين' && r.status !== 'قيد التنفيذ').reverse();
        callback(assigned, history);
    }, (error) => {
        console.error("Error fetching volunteer requests:", error);
    });
    return unsubscribe;
}

/**
 * Subscribes to real-time updates for a single volunteer by their ID.
 * @param {string} volunteerId - The ID of the volunteer.
 * @param {(volunteer: Volunteer | null) => void} callback - Function to call with volunteer data.
 * @returns {() => void} An unsubscribe function.
 */
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

/**
 * Updates a volunteer's profile information (profession or region).
 * @param {string} id - The ID of the volunteer.
 * @param {Partial<Pick<Volunteer, 'profession' | 'region'>>} data - The data to update.
 */
export async function updateVolunteerProfile(id: string, data: Partial<Pick<Volunteer, 'profession' | 'region'>>) {
    const volunteerRef = ref(db, `${VOLUNTEERS_PATH}/${id}`);
    await update(volunteerRef, data);
}

// --- Notification Functions ---

/**
 * Saves a user's FCM device token to the database, allowing them to receive push notifications.
 * @param {string} userId - The ID of the user (admin or sanitized volunteer email).
 * @param {string} token - The FCM device token.
 */
export async function saveDeviceToken(userId: string, token: string) {
    const tokenRef = ref(db, `${DEVICE_TOKENS_PATH}/${userId}/${token}`);
    await set(tokenRef, true);
}

/**
 * Retrieves all FCM device tokens for a given user ID.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<string[]>} A promise resolving to an array of device tokens.
 */
export async function getAdminDeviceTokens(userId: string): Promise<string[]> {
    const tokensRef = ref(db, `${DEVICE_TOKENS_PATH}/${userId}`);
    const snapshot = await get(tokensRef);
    if(snapshot.exists()) {
        return Object.keys(snapshot.val());
    }
    return [];
}

/**
 * Adds a notification payload to a queue in the database.
 * A backend process (like a Cloud Function) should listen to this path to send the actual push notification.
 * @param {string} targetIdOrToken - The user ID or a specific FCM token to target.
 * @param {string} title - The title of the notification.
 * @param {string} body - The body message of the notification.
 */
export async function sendNotificationToVolunteer(targetIdOrToken: string, title: string, body: string) {
    const notificationsRef = ref(db, NOTIFICATIONS_PATH);
    const newNotificationRef = push(notificationsRef);
    await set(newNotificationRef, {
        target: targetIdOrToken,
        title,
        body,
        createdAt: serverTimestamp()
    });
}
