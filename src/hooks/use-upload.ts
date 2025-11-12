
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

      // Add new uploads to the state
      setUploads((prev) => [...prev, ...newUploadsData]);

      // Start each upload
      newUploadsData.forEach((upload) => {
        const storageRef = ref(storage, `product-images/${upload.id}-${upload.file.name}`);
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
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
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
            });
          }
        );
      });
    },
    [storage, onUploadComplete]
  );

  return { uploads, uploadFiles };
}
