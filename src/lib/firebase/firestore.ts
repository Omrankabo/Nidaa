import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp,
  deleteDoc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "./config";
import type { EmergencyRequest, Volunteer } from "../types";

const REQUESTS_COLLECTION = "requests";
const VOLUNTEERS_COLLECTION = "volunteers";

// Requests
export async function addRequest(request: Omit<EmergencyRequest, 'id' | 'timestamp'>) {
  const docRef = await addDoc(collection(db, REQUESTS_COLLECTION), {
      ...request,
      timestamp: serverTimestamp()
  });
  return docRef.id;
}

export function getRequests(
    callback: (requests: EmergencyRequest[]) => void, 
    setLoading: (loading: boolean) => void
) {
    const q = query(collection(db, REQUESTS_COLLECTION), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const requests = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return { 
                id: doc.id, 
                ...data,
                timestamp: data.timestamp?.toDate ? data.timestamp.toDate().toISOString() : new Date().toISOString()
            } as EmergencyRequest
        });
        callback(requests);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching requests:", error);
        setLoading(false);
    });
    return unsubscribe;
}

export async function updateRequest(id: string, data: Partial<EmergencyRequest>) {
    const docRef = doc(db, REQUESTS_COLLECTION, id);
    await updateDoc(docRef, data);
}

export async function updateRequestStatus(id: string, status: EmergencyRequest['status']) {
    const docRef = doc(db, REQUESTS_COLLECTION, id);
    await updateDoc(docRef, { status });
}


// Volunteers
export async function addVolunteer(volunteer: Volunteer) {
    const docRef = doc(db, VOLUNTEERS_COLLECTION, volunteer.id);
    await setDoc(docRef, {
        ...volunteer,
        createdAt: serverTimestamp()
    });
}

export function getVolunteers(
    callback: (volunteers: Volunteer[]) => void,
    setLoading: (loading: boolean) => void
) {
    const q = query(collection(db, VOLUNTEERS_COLLECTION), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const volunteers = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Volunteer));
        callback(volunteers);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching volunteers:", error);
        setLoading(false);
    });
    return unsubscribe;
}

export async function getVerifiedVolunteers(): Promise<Volunteer[]> {
    const q = query(collection(db, VOLUNTEERS_COLLECTION), where("status", "==", "تم التحقق"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Volunteer));
}

export async function getVolunteerByEmail(email: string): Promise<Volunteer | null> {
    const q = query(collection(db, VOLUNTEERS_COLLECTION), where("email", "==", email));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return null;
    }
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Volunteer;
}


export async function updateVolunteerStatus(id: string, status: Volunteer['status']) {
    const docRef = doc(db, VOLUNTEERS_COLLECTION, id);
    await updateDoc(docRef, { status });
}

export async function deleteVolunteer(id: string) {
    const docRef = doc(db, VOLUNTEERS_COLLECTION, id);
    await deleteDoc(docRef);
}


// Volunteer Dashboard
export function getVolunteerRequests(
    volunteerId: string,
    callback: (assigned: EmergencyRequest[], history: EmergencyRequest[]) => void
) {
    const q = query(collection(db, REQUESTS_COLLECTION), where('volunteerId', '==', volunteerId), orderBy('timestamp', 'desc'));
    return onSnapshot(q, (querySnapshot) => {
        const allRequests = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                timestamp: data.timestamp?.toDate ? data.timestamp.toDate().toISOString() : new Date().toISOString()
             } as EmergencyRequest
        });
        const assigned = allRequests.filter(r => r.status === 'تم التعيين');
        const history = allRequests.filter(r => r.status !== 'تم التعيين');
        callback(assigned, history);
    });
}

export function getVolunteerById(volunteerId: string, callback: (volunteer: Volunteer | null) => void) {
    const docRef = doc(db, VOLUNTEERS_COLLECTION, volunteerId);
    return onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
            callback({ id: docSnap.id, ...docSnap.data() } as Volunteer);
        } else {
            callback(null);
        }
    });
}

export async function updateVolunteerProfile(id: string, data: Partial<Pick<Volunteer, 'profession' | 'region'>>) {
    const docRef = doc(db, VOLUNTEERS_COLLECTION, id);
    await updateDoc(docRef, data);
}
