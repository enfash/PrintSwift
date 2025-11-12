
'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, UploadCloud } from 'lucide-react';
import { useUpload } from '@/hooks/use-upload';
import { Progress } from '@/components/ui/progress';
import { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { getStorage, ref, listAll, getDownloadURL } from 'firebase/storage';
import { useFirebaseApp } from '@/firebase/provider';

export default function MediaPage() {
    const firebaseApp = useFirebaseApp();
    const [mediaItems, setMediaItems] = useState<{ id: string, url: string, name: string }[]>([]);

    const fetchMedia = useCallback(async () => {
        if (!firebaseApp) return;
        const storage = getStorage(firebaseApp);
        const listRef = ref(storage, 'product-images');
        try {
            const res = await listAll(listRef);
            const items = await Promise.all(res.items.map(async (itemRef) => {
                const url = await getDownloadURL(itemRef);
                return { id: itemRef.fullPath, url, name: itemRef.name };
            }));
            setMediaItems(items);
        } catch (error) {
            console.error("Failed to fetch media:", error);
        }
    }, [firebaseApp]);

    const { uploads, uploadFiles } = useUpload(fetchMedia); // Pass fetchMedia as a callback

    const onDrop = useCallback((acceptedFiles: File[]) => {
        uploadFiles(acceptedFiles);
    }, [uploadFiles]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    useEffect(() => {
        fetchMedia();
    }, [fetchMedia]);

    const allUploadsFinished = uploads.every(u => u.status === 'success' || u.status === 'error');

    return (
        <>
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Media Library</h1>
                 <label className="flex items-center justify-center px-4 h-10 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer">
                    <PlusCircle className="mr-2 h-4 w-4" /> Upload Media
                    <input {...getInputProps({multiple: true})} className="hidden" />
                </label>
            </div>
            <Card className="mt-6">
                <CardContent className="p-4">
                    <div {...getRootProps({className: `flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted transition ${isDragActive ? 'border-primary' : ''}`})}>
                        <input {...getInputProps()} />
                        <div className="flex flex-col items-center justify-center">
                            <UploadCloud className="w-8 h-8 mb-3 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                                {isDragActive ? 'Drop the files here...' : 'Drag & drop some files here, or click the button to select files'}
                            </p>
                        </div>
                    </div>
                    {uploads.length > 0 && !allUploadsFinished && (
                        <div className="mt-4">
                            <h2 className="text-lg font-semibold">Uploads</h2>
                            <ul className="space-y-2 mt-2">
                                {uploads.filter(u => u.status === 'uploading').map(upload => (
                                    <li key={upload.id}>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="truncate max-w-xs">{upload.file.name}</span>
                                            <span>{Math.round(upload.progress)}%</span>
                                        </div>
                                        <Progress value={upload.progress} className="w-full h-2" />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-6">
                        {mediaItems.length > 0 ? (
                            mediaItems.map(item => (
                                <Card key={item.id} className="overflow-hidden group">
                                    <div className="aspect-square relative">
                                        <Image
                                            src={item.url}
                                            alt={item.name}
                                            fill
                                            className="object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Button variant="secondary" size="sm">View</Button>
                                        </div>
                                    </div>
                                </Card>
                            ))
                        ) : (
                            <div className="col-span-full text-center text-muted-foreground py-12">
                                Your media library is empty.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </>
    );
}
