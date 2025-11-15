
'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase(): { firebaseApp: FirebaseApp, auth: Auth, firestore: Firestore, storage: FirebaseStorage } {
  let firebaseApp: FirebaseApp;
  let firestore: Firestore;

  if (!getApps().length) {
    firebaseApp = initializeApp(firebaseConfig);
    firestore = initializeFirestore(firebaseApp, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    });
  } else {
    firebaseApp = getApp();
    firestore = getFirestore(firebaseApp);
  }
  
  const auth = getAuth(firebaseApp);
  const storage = getStorage(firebaseApp);

  return { firebaseApp, auth, firestore, storage };
}


export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
// export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';

// Corrected non-blocking update exports
export {
  setDocumentNonBlocking,
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
  deleteDocumentNonBlocking,
} from './non-blocking-updates';
