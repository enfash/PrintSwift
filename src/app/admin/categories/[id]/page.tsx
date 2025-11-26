
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { LoaderCircle, UploadCloud } from 'lucide-react';
import { useDoc, useFirestore, useMemoFirebase, updateDocumentNonBlocking, useStorage } from '@/firebase';
import { doc, serverTimestamp } from 'firebase/firestore';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useEffect, useState, use } from 'react';
import Image from 'next/image';
import useUnsavedChangesWarning from '@/hooks/use-unsaved-changes-warning';
import { cn, compressImage } from '@/lib/utils';


const categorySchema = z.object({
  name: z.string().min(3, 'Category name must be at least 3 characters.'),
  description: z.string().optional(),
  iconUrl: z.string().url().optional().or(z.literal('')),
  backgroundColor: z.string().optional(),
});


export default function CategoryEditPage({ params }: { params: { id: string } }) {
    const { id } = use(params);
    const firestore = useFirestore();
    const storage = useStorage();
    const router = useRouter();
    const { toast } = useToast();
    const [isUploading, setIsUploading] = useState(false);
    
    const categoryRef = useMemoFirebase(() => firestore ? doc(firestore, 'product_categories', id) : null, [firestore, id]);
    const { data: category, isLoading: isLoadingCategory } = useDoc<z.infer<typeof categorySchema>>(categoryRef);

    const form = useForm<z.infer<typeof categorySchema>>({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            name: '',
            description: '',
            iconUrl: '',
            backgroundColor: '#F7FAFC',
        }
    });

    const { formState: { isDirty, isSubmitting } } = form;
    useUnsavedChangesWarning(isDirty);

    useEffect(() => {
        if (category) {
            form.reset({
                ...category,
                description: category.description || '', // Ensure description is not undefined
                iconUrl: category.iconUrl || '',
                backgroundColor: category.backgroundColor || '#F7FAFC',
            });
        }
    }, [category, form]);

    const iconUrl = form.watch('iconUrl');

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!storage || !event.target.files || event.target.files.length === 0) return;
        const file = event.target.files[0];
        setIsUploading(true);
        
        try {
            const compressedFile = await compressImage(file, 0.5, 512); // Max 0.5MB, 512px
            const path = `category-icons/${id}/${compressedFile.name}`;
            const fileRef = storageRef(storage, path);
            const uploadTask = uploadBytesResumable(fileRef, compressedFile);
    
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
        } catch (error) {
            setIsUploading(false);
            toast({ variant: 'destructive', title: 'Upload failed', description: (error as Error).message });
        }
    };
    
    const onSubmit = async (values: z.infer<typeof categorySchema>) => {
        if (!firestore) return;
        
        try {
            const categoryDocRef = doc(firestore, 'product_categories', id);
            await updateDocumentNonBlocking(categoryDocRef, {...values, updatedAt: serverTimestamp()});
            toast({ title: 'Category Updated', description: `Category "${values.name}" has been successfully updated.` });
            form.reset(values); // Reset form to new values, making it not dirty
            router.push('/admin/categories');
        } catch (error) {
            console.error("Error updating category:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not update the category.' });
        }
    };

    if (isLoadingCategory) {
        return <div className="flex h-96 items-center justify-center"><LoaderCircle className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">Edit Category</h1>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" type="button" onClick={() => router.push('/admin/categories')}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting || isUploading}>
                            {(isSubmitting || isUploading) && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </div>
                </div>

                <div className="grid gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Category Details</CardTitle>
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
                            <FormItem>
                                <FormLabel>Slug / ID</FormLabel>
                                <FormControl><Input value={id} disabled /></FormControl>
                            </FormItem>
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl><Textarea placeholder="A brief description of what this category contains." {...field} value={field.value || ''} /></FormControl>
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
                                            <label className={cn("flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted transition", isUploading && "opacity-50 cursor-not-allowed")}>
                                                <div className="flex flex-col items-center justify-center text-center">
                                                    {isUploading ? <LoaderCircle className="w-6 h-6 text-muted-foreground animate-spin"/> : <UploadCloud className="w-6 h-6 text-muted-foreground"/>}
                                                    <p className="mt-1 text-xs text-muted-foreground">{isUploading ? 'Uploading...' : 'Click to upload SVG or image'}</p>
                                                </div>
                                                <Input id="iconUpload" type="file" className="hidden" accept="image/svg+xml,image/*" onChange={handleFileUpload} disabled={isUploading}/>
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
