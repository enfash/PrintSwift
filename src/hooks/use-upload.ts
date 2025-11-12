
'use client';

import { useState, useCallback } from 'react';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, UploadTask } from 'firebase/storage';

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

  const startUpload = useCallback((file: File) => {
    const id = `${file.name}-${Date.now()}`;
    
    setUploads(prev => [...prev, { id, file, status: 'uploading', progress: 0 }]);

    const storage = getStorage();
    const storageRef = ref(storage, `product-images/${id}-${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploads(prev => prev.map(u => (u.id === id ? { ...u, progress } : u)));
      },
      (error) => {
        setUploads(prev =>
          prev.map(u => (u.id === id ? { ...u, status: 'error', error } : u))
        );
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setUploads(prev =>
            prev.map(u =>
              u.id === id ? { ...u, status: 'success', url: downloadURL, progress: 100 } : u
            )
          );
          if (onUploadComplete) {
            onUploadComplete(downloadURL);
          }
        });
      }
    );
  }, [onUploadComplete]);
  
  const uploadFiles = useCallback((files: File[]) => {
    files.forEach(file => startUpload(file));
  }, [startUpload]);

  return { uploads, uploadFiles };
}
