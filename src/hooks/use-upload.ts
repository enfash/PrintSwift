
'use client';

import { useState, useCallback } from 'react';
import { ref, uploadBytesResumable, getDownloadURL, type FirebaseStorage } from 'firebase/storage';
import { useStorage } from '@/firebase/provider';

export type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export interface Upload {
  id: string;
  file: File;
  status: UploadStatus;
  progress: number;
  url?: string;
  error?: Error;
}

export function useUpload(onUploadComplete?: (url: string) => void) {
  const [uploads, setUploads] = useState<Upload[]>([]);
  const storage = useStorage();

  const uploadFiles = useCallback(
    (files: File[]) => {
      if (!storage) {
        console.error("Firebase Storage not available for upload.");
        return;
      }
      
      const newUploadsData: Upload[] = files.map((file) => ({
        id: `${file.name}-${Date.now()}`,
        file,
        status: 'uploading',
        progress: 0,
      }));

      // Add new uploads to the state immediately to show them in the UI
      setUploads((prev) => [...prev, ...newUploadsData]);

      // Start each upload
      newUploadsData.forEach((upload) => {
        // Sanitize file name for URL safety
        const sanitizedFileName = encodeURIComponent(upload.file.name);
        const storageRef = ref(storage, `product-images/${upload.id}-${sanitizedFileName}`);
        const uploadTask = uploadBytesResumable(storageRef, upload.file);

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploads((prev) =>
              prev.map((u) => (u.id === upload.id ? { ...u, progress } : u))
            );
          },
          (error) => {
            console.error('Upload error:', error);
            setUploads((prev) =>
              prev.map((u) => (u.id === upload.id ? { ...u, status: 'error', error } : u))
            );
          },
          async () => { // Make this function async to use await
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              setUploads((prev) =>
                prev.map((u) =>
                  u.id === upload.id
                    ? { ...u, status: 'success', url: downloadURL, progress: 100 }
                    : u
                )
              );
              if (onUploadComplete) {
                onUploadComplete(downloadURL);
              }
            } catch (error) {
              console.error("Failed to get download URL:", error);
               setUploads((prev) =>
                prev.map((u) => (u.id === upload.id ? { ...u, status: 'error', error: error as Error } : u))
              );
            }
          }
        );
      });
    },
    [storage, onUploadComplete]
  );

  return { uploads, uploadFiles };
}
