
import { collection, addDoc, doc, updateDoc, deleteDoc, serverTimestamp, query, orderBy, limit, startAfter, getDocs, getDoc, Firestore, where } from 'firebase/firestore';

const COLLECTION = 'customers';

export async function createCustomer(db: Firestore, data: any) {
  // Check if a customer with this email already exists
  const q = query(collection(db, COLLECTION), where("email", "==", data.email), limit(1));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    // Customer exists, update them with any new info
    const existingCustomerId = querySnapshot.docs[0].id;
    const customerDocRef = doc(db, COLLECTION, existingCustomerId);
    const payload = {
        ...data,
        name_lower: data.name?.toLowerCase?.() || '',
        updatedAt: serverTimestamp(),
    };
    // Only update fields that are provided
    Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);
    await updateDoc(customerDocRef, payload, { merge: true });
    return customerDocRef;
  } else {
    // New customer, create them
    const ref = collection(db, COLLECTION);
    const payload = {
        ...data,
        name_lower: data.name?.toLowerCase?.() || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    };
    return await addDoc(ref, payload);
  }
}

export async function updateCustomer(db: Firestore, id: string, data: any) {
  const docRef = doc(db, COLLECTION, id);
  const payload = {
    ...data,
    name_lower: data.name?.toLowerCase?.() || '',
    updatedAt: serverTimestamp(),
  };
  return await updateDoc(docRef, payload);
}

export async function deleteCustomer(db: Firestore, id: string) {
  return await deleteDoc(doc(db, COLLECTION, id));
}

export async function getCustomer(db: Firestore, id: string) {
  const d = await getDoc(doc(db, COLLECTION, id));
  return d.exists() ? { id: d.id, ...d.data() } : null;
}

// Example: very small pageinated list (server-side)
export async function listCustomers(db: Firestore, limitN=20, startAfterDoc=null) {
  const q = startAfterDoc
    ? query(collection(db, COLLECTION), orderBy('createdAt','desc'), startAfter(startAfterDoc), limit(limitN))
    : query(collection(db, COLLECTION), orderBy('createdAt','desc'), limit(limitN));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
