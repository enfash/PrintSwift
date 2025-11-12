
'use client';

import { useState, useCallback } from 'react';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useFirebaseApp } from '@/firebase';

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
  const app = useFirebaseApp(); // Use the initialized app instance

  const uploadFiles = useCallback(
    (files: File[]) => {
      if (!app) {
        console.error("Firebase app not available for upload.");
        return;
      }
      
      const storage = getStorage(app);

      const newUploadsData: Upload[] = files.map((file) => ({
        id: `${file.name}-${Date.now()}`,
        file,
        status: 'uploading',
        progress: 0,
      }));

      setUploads((prev) => [...prev, ...newUploadsData]);

      newUploadsData.forEach((upload) => {
        const storageRef = ref(storage, `product-images/${upload.id}-${upload.file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, upload.file);

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploads((prev) =>
              prev.map((u) => (u.id === upload.id ? { ...u, progress: progress } : u))
            );
          },
          (error) => {
            console.error('Upload error:', error);
            setUploads((prev) =>
              prev.map((u) => (u.id === upload.id ? { ...u, status: 'error', error } : u))
            );
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              setUploads((prev) =>
                prev.map((u) =>
                  u.id === upload.id
                    ? { ...u, status: 'success', url: downloadURL, progress: 100 }
                    : u
                )
              );
              onUploadComplete?.(downloadURL);
            });
          }
        );
      });
    },
    [app, onUploadComplete]
  );

  return { uploads, uploadFiles };
}
