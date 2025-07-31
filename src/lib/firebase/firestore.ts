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
  serverTimestamp
} from "firebase/firestore";
import { db } from "./config";
import type { EmergencyRequest, Volunteer } from "../types";

const REQUESTS_COLLECTION = "requests";
const VOLUNTEERS_COLLECTION = "volunteers";

// Requests
export async function addRequest(request: Omit<EmergencyRequest, 'id'>) {
  const docRef = await addDoc(collection(db, REQUESTS_COLLECTION), request);
  return docRef.id;
}

export function getRequests(
    callback: (requests: EmergencyRequest[]) => void, 
    setLoading: (loading: boolean) => void
) {
    const q = query(collection(db, REQUESTS_COLLECTION), orderBy('timestamp', 'desc'));
    return onSnapshot(q, (querySnapshot) => {
        const requests = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EmergencyRequest));
        callback(requests);
        setLoading(false);
    });
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
export async function addVolunteer(volunteer: Omit<Volunteer, 'id'>) {
    await addDoc(collection(db, VOLUNTEERS_COLLECTION), {
        ...volunteer,
        createdAt: serverTimestamp()
    });
}

export function getVolunteers(
    callback: (volunteers: Volunteer[]) => void,
    setLoading: (loading: boolean) => void
) {
    const q = query(collection(db, VOLUNTEERS_COLLECTION), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (querySnapshot) => {
        const volunteers = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Volunteer));
        callback(volunteers);
        setLoading(false);
    });
}

export async function getVerifiedVolunteers(): Promise<Volunteer[]> {
    const q = query(collection(db, VOLUNTEERS_COLLECTION), where("status", "==", "تم التحقق"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Volunteer));
}

export async function updateVolunteerStatus(id: string, status: Volunteer['status']) {
    const docRef = doc(db, VOLUNTEERS_COLLECTION, id);
    await updateDoc(docRef, { status });
}

// Volunteer Dashboard
export function getVolunteerRequests(
    volunteerId: string,
    callback: (assigned: EmergencyRequest[], history: EmergencyRequest[]) => void
) {
    const q = query(collection(db, REQUESTS_COLLECTION), where('volunteerId', '==', volunteerId), orderBy('timestamp', 'desc'));
    return onSnapshot(q, (querySnapshot) => {
        const allRequests = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EmergencyRequest));
        const assigned = allRequests.filter(r => r.status === 'تم التعيين');
        const history = allRequests.filter(r => r.status !== 'تم التعيين');
        callback(assigned, history);
    });
}
