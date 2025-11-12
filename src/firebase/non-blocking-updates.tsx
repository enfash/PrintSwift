'use client';
    
import {
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  CollectionReference,
  DocumentReference,
  SetOptions,
  FirestoreError,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import {FirestorePermissionError} from '@/firebase/errors';

/**
 * Initiates a setDoc operation for a document reference.
 * Does NOT await the write operation internally.
 */
export function setDocumentNonBlocking(docRef: DocumentReference, data: any, options: SetOptions) {
  setDoc(docRef, data, options).catch(error => {
    if (error instanceof FirestoreError && error.code === 'permission-denied') {
        errorEmitter.emit(
          'permission-error',
          new FirestorePermissionError({
            path: docRef.path,
            operation: 'write', // or 'create'/'update' based on options
            requestResourceData: data,
          })
        )
    } else {
        // Re-throw other errors to be caught by the caller
        throw error;
    }
  })
  // Execution continues immediately
}


/**
 * Initiates an addDoc operation for a collection reference.
 * Does NOT await the write operation internally.
 * Returns the Promise for the new doc ref, but typically not awaited by caller.
 */
export function addDocumentNonBlocking(colRef: CollectionReference, data: any, options?: { id: string }) {
    const promise = addDoc(colRef, data)
        .catch(error => {
            if (error instanceof FirestoreError && error.code === 'permission-denied') {
                errorEmitter.emit(
                    'permission-error',
                    new FirestorePermissionError({
                    path: colRef.path,
                    operation: 'create',
                    requestResourceData: data,
                    })
                )
            } else {
                throw error;
            }
        });
    return promise;
}


/**
 * Initiates an updateDoc operation for a document reference.
 * Does NOT await the write operation internally.
 */
export function updateDocumentNonBlocking(docRef: DocumentReference, data: any) {
  return updateDoc(docRef, data)
    .catch(error => {
      if (error instanceof FirestoreError && error.code === 'permission-denied') {
          errorEmitter.emit(
            'permission-error',
            new FirestorePermissionError({
              path: docRef.path,
              operation: 'update',
              requestResourceData: data,
            })
          )
      } else {
          // Re-throw other types of errors so they can be handled by the caller.
          throw error;
      }
    });
}


/**
 * Initiates a deleteDoc operation for a document reference.
 * Does NOT await the write operation internally.
 */
export function deleteDocumentNonBlocking(docRef: DocumentReference) {
  deleteDoc(docRef)
    .catch(error => {
      if (error instanceof FirestoreError && error.code === 'permission-denied') {
          errorEmitter.emit(
            'permission-error',
            new FirestorePermissionError({
              path: docRef.path,
              operation: 'delete',
            })
          )
      } else {
          throw error;
      }
    });
}
