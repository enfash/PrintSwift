
'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, UploadCloud, LoaderCircle, Trash2 } from 'lucide-react';
import { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { listAll, getDownloadURL, uploadBytes, ref as storageRef, deleteObject } from 'firebase/storage';
import { useStorage } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { getSafeImageUrl } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


type MediaItem = {
    id: string;
    url: string;
    name: string;
    refPath: string;
};

export default function MediaPage() {
    const storage = useStorage();
    const { toast } = useToast();
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
    const [isLoadingMedia, setIsLoadingMedia] = useState(true);
    const [isUploading, setIsUploading] = useState(false);

    const fetchMedia = useCallback(async () => {
        if (!storage) return;
        setIsLoadingMedia(true);
        try {
            const listRef = storageRef(storage, 'product-images');
            const res = await listAll(listRef);
            const items = await Promise.all(res.items.map(async (itemRef) => {
                const url = await getDownloadURL(itemRef);
                return { id: itemRef.fullPath, url, name: itemRef.name, refPath: itemRef.fullPath };
            }));
            setMediaItems(items);
        } catch (error) {
            console.error("Failed to fetch media:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch media files.' });
        } finally {
            setIsLoadingMedia(false);
        }
    }, [storage, toast]);

    useEffect(() => {
        fetchMedia();
    }, [fetchMedia]);

    const handleUpload = async (files: File[]) => {
        if (!storage || files.length === 0) return;
        
        setIsUploading(true);
        let successCount = 0;

        for (const file of files) {
            const newFileRef = storageRef(storage, `product-images/${file.name}`);
            try {
                await uploadBytes(newFileRef, file);
                successCount++;
            } catch (error) {
                console.error("Upload error:", error);
                toast({ variant: 'destructive', title: `Upload Failed: ${file.name}`, description: (error as Error).message });
            }
        }
        
        setIsUploading(false);
        if (successCount > 0) {
            toast({ title: 'Upload Complete', description: `${successCount} of ${files.length} files uploaded.` });
            await fetchMedia(); // Refresh media library
        }
    };
    
    const handleDelete = async (refPath: string) => {
        if (!storage) return;
        
        const fileRef = storageRef(storage, refPath);
        try {
            await deleteObject(fileRef);
            setMediaItems(prev => prev.filter(item => item.refPath !== refPath));
            toast({ title: 'Media Deleted', description: 'The file has been removed from storage.' });
        } catch (error) {
            console.error('Delete error:', error);
            toast({ variant: 'destructive', title: 'Delete Failed', description: 'Could not delete the file.' });
        }
    };

    const onDrop = useCallback((acceptedFiles: File[]) => {
        handleUpload(acceptedFiles);
    }, [handleUpload]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    return (
        <>
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Media Library</h1>
                <label className="flex items-center justify-center px-4 h-10 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer">
                    {isUploading ? (
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <PlusCircle className="mr-2 h-4 w-4" />
                    )}
                    {isUploading ? 'Uploading...' : 'Upload Media'}
                    <input {...getInputProps({ multiple: true })} className="hidden" disabled={isUploading} />
                </label>
            </div>
            <Card className="mt-6">
                <CardContent className="p-4">
                    <div {...getRootProps({ className: `flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted transition ${isDragActive ? 'border-primary' : ''} ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}` })}>
                        <input {...getInputProps()} disabled={isUploading}/>
                        <div className="flex flex-col items-center justify-center">
                            <UploadCloud className="w-8 h-8 mb-3 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                                {isDragActive ? 'Drop the files here...' : 'Drag & drop some files here, or click to select'}
                            </p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-6">
                        {isLoadingMedia ? (
                            <div className="col-span-full text-center text-muted-foreground py-12">
                                <LoaderCircle className="mx-auto h-8 w-8 animate-spin" />
                                <p className="mt-2">Loading media...</p>
                            </div>
                        ) : mediaItems.length > 0 ? (
                            mediaItems.map(item => (
                                <Card key={item.id} className="overflow-hidden group">
                                    <div className="aspect-square relative">
                                        <Image
                                            src={getSafeImageUrl(item.url, item.id)}
                                            alt={item.name}
                                            fill
                                            className="object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="destructive" size="icon">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This will permanently delete the file "{item.name}". This action cannot be undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDelete(item.refPath)} className="bg-destructive hover:bg-destructive/90">
                                                            Delete
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
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
