
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { LoaderCircle, UploadCloud } from 'lucide-react';
import { useFirestore, addDocumentNonBlocking, useStorage } from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import useUnsavedChangesWarning from '@/hooks/use-unsaved-changes-warning';
import { cn } from '@/lib/utils';

const categorySchema = z.object({
  id: z.string().min(3, 'Slug/ID must be at least 3 characters.').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with dashes.'),
  name: z.string().min(3, 'Category name must be at least 3 characters.'),
  description: z.string().optional(),
  iconUrl: z.string().url().optional().or(z.literal('')),
  backgroundColor: z.string().optional(),
});

const slugify = (str: string) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');


export default function CategoryFormPage() {
    const firestore = useFirestore();
    const storage = useStorage();
    const router = useRouter();
    const { toast } = useToast();
    const [isUploading, setIsUploading] = useState(false);

    const form = useForm<z.infer<typeof categorySchema>>({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            id: '',
            name: '',
            description: '',
            iconUrl: '',
            backgroundColor: '#F7FAFC',
        },
    });

    const { formState: { isDirty, isSubmitting } } = form;
    useUnsavedChangesWarning(isDirty);
    
    const watchName = form.watch('name');
    const watchId = form.watch('id');
    const iconUrl = form.watch('iconUrl');

    useEffect(() => {
        if (watchName) {
            form.setValue('id', slugify(watchName), { shouldValidate: true });
        }
    }, [watchName, form]);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const categoryId = form.getValues('id');
        if (!categoryId) {
            toast({ variant: 'destructive', title: 'Slug/ID required', description: 'Please enter a slug/ID before uploading an icon.' });
            return;
        }
        if (!storage || !event.target.files || event.target.files.length === 0) return;
        const file = event.target.files[0];
        setIsUploading(true);

        const MAX_MB = 2;
        if (file.size > MAX_MB * 1024 * 1024) {
            setIsUploading(false);
            toast({ variant: 'destructive', title: 'File too large', description: `Max file size is ${MAX_MB}MB.` });
            return;
        }
        
        if (!file.type.startsWith('image/')) {
            setIsUploading(false);
            toast({ variant: 'destructive', title: 'Invalid File Type', description: 'Only SVG and image files are allowed.'});
            return;
        }

        const path = `category-icons/${categoryId}/${file.name}`;
        const fileRef = storageRef(storage, path);
        const uploadTask = uploadBytesResumable(fileRef, file);

        uploadTask.on('state_changed',
            () => {},
            (error) => {
                setIsUploading(false);
                toast({ variant: 'destructive', title: 'Upload failed', description: error.message });
            },
            async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                form.setValue('iconUrl', downloadURL, { shouldDirty: true });
                setIsUploading(false);
                toast({ title: 'Icon Uploaded', description: 'Icon is ready to be saved.' });
            }
        );
    };

    const onSubmit = async (values: z.infer<typeof categorySchema>) => {
        if (!firestore) return;
        
        try {
            const finalData = {
                ...values,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };
            await addDocumentNonBlocking(collection(firestore, 'product_categories'), finalData, { id: values.id });

            toast({ title: 'Category Created', description: `Category "${values.name}" has been successfully created.` });
            form.reset();
            router.push('/admin/categories');

        } catch (error) {
            console.error("Error saving category:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not save the category. The ID might already exist.' });
        }
    };


    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">Add New Category</h1>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" type="button" onClick={() => router.push('/admin/categories')}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting || isUploading}>
                            {(isSubmitting || isUploading) && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            Save Category
                        </Button>
                    </div>
                </div>

                <div className="grid gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Category Details</CardTitle>
                            <CardDescription>Fill in the information for your new category.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category Name</FormLabel>
                                        <FormControl><Input placeholder="e.g., Marketing Materials" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Slug / ID</FormLabel>
                                        <FormControl><Input placeholder="auto-generated-from-name" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl><Textarea placeholder="A brief description of what this category contains." {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="iconUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category Icon</FormLabel>
                                        <div className="flex items-center gap-4">
                                            {iconUrl && (
                                                <Image
                                                    src={iconUrl}
                                                    alt="Icon preview"
                                                    width={64}
                                                    height={64}
                                                    className="rounded-md object-contain border p-2"
                                                />
                                            )}
                                            <label className={cn("flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted transition", (isUploading || !watchId) && "opacity-50 cursor-not-allowed")}>
                                                <div className="flex flex-col items-center justify-center text-center">
                                                    {isUploading ? <LoaderCircle className="w-6 h-6 text-muted-foreground animate-spin"/> : <UploadCloud className="w-6 h-6 text-muted-foreground"/>}
                                                    <p className="mt-1 text-xs text-muted-foreground">{isUploading ? 'Uploading...' : 'Click to upload SVG or image'}</p>
                                                </div>
                                                <Input id="iconUpload" type="file" className="hidden" accept="image/svg+xml,image/*" onChange={handleFileUpload} disabled={isUploading || !watchId}/>
                                            </label>
                                        </div>
                                        <FormControl><Input type="hidden" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="backgroundColor"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Background Color</FormLabel>
                                        <div className="flex items-center gap-2">
                                            <FormControl>
                                                <Input type="color" className="w-12 h-10 p-1" {...field} />
                                            </FormControl>
                                            <Input placeholder="#F7FAFC" {...field} />
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>
                </div>
            </form>
        </Form>
    );
}

    