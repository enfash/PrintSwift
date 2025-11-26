
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { LoaderCircle, Star, UploadCloud } from 'lucide-react';
import { useFirestore, addDocumentNonBlocking, useStorage } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useState } from 'react';
import { cn, compressImage } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import Image from 'next/image';
import useUnsavedChangesWarning from '@/hooks/use-unsaved-changes-warning';

const MAX_QUOTE_LENGTH = 280;

const testimonialSchema = z.object({
  name: z.string().min(2, 'Name is required.'),
  company: z.string().optional(),
  quote: z.string().min(10, 'Testimonial text is too short.').max(MAX_QUOTE_LENGTH, `Testimonial must be ${MAX_QUOTE_LENGTH} characters or less.`),
  rating: z.number().min(1).max(5),
  visible: z.boolean().default(true),
  imageUrl: z.string().url().optional().or(z.literal('')),
});

export default function NewTestimonialPage() {
    const firestore = useFirestore();
    const storage = useStorage();
    const router = useRouter();
    const { toast } = useToast();
    const [isUploading, setIsUploading] = useState(false);
    const [hoverRating, setHoverRating] = useState(0);
    const [testimonialId] = useState(() => doc(collection(firestore, 'testimonials')).id);

    const form = useForm<z.infer<typeof testimonialSchema>>({
        resolver: zodResolver(testimonialSchema),
        defaultValues: {
            name: '',
            company: '',
            quote: '',
            rating: 5,
            visible: true,
            imageUrl: '',
        },
    });
    
    const { formState: { isDirty, isSubmitting } } = form;
    useUnsavedChangesWarning(isDirty);

    const currentRating = form.watch('rating');
    const quoteValue = form.watch('quote');
    const imageUrl = form.watch('imageUrl');

    const onSubmit = async (values: z.infer<typeof testimonialSchema>) => {
        if (!firestore) return;
        
        try {
            const testimonialsCollection = collection(firestore, 'testimonials');
            await addDocumentNonBlocking(testimonialsCollection, {...values, id: testimonialId});
            
            toast({ title: 'Testimonial Created', description: `The new testimonial has been added.` });
            form.reset();
            router.push('/admin/testimonials');

        } catch (error) {
            console.error("Error saving testimonial:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not save the testimonial.' });
        }
    };
    
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!storage || !event.target.files || event.target.files.length === 0) return;

        const file = event.target.files[0];
        setIsUploading(true);

        try {
            const compressedFile = await compressImage(file, 1.0, 800); // Max 1MB, 800px
            const path = `testimonials/${testimonialId}/${compressedFile.name}`;
            const fileRef = storageRef(storage, path);
            const uploadTask = uploadBytesResumable(fileRef, compressedFile);
    
            uploadTask.on('state_changed',
                () => { /* Progress can be handled here */ },
                (error) => {
                    setIsUploading(false);
                    toast({ variant: 'destructive', title: 'Upload failed', description: error.message });
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    form.setValue('imageUrl', downloadURL, { shouldDirty: true });
                    setIsUploading(false);
                    toast({ title: 'Image Uploaded', description: 'Image is ready to be saved with the testimonial.' });
                }
            );
        } catch (error) {
            setIsUploading(false);
            toast({ variant: 'destructive', title: 'Upload Failed', description: (error as Error).message });
        }
    };


    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">Add New Testimonial</h1>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" type="button" onClick={() => router.push('/admin/testimonials')}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting || isUploading}>
                            {(isSubmitting || isUploading) && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            Save Testimonial
                        </Button>
                    </div>
                </div>

                <div className="grid gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Testimonial Details</CardTitle>
                            <CardDescription>Fill in the customer's feedback.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid sm:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Customer Name</FormLabel>
                                            <FormControl><Input placeholder="e.g., Chidi A." {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="company"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Company</FormLabel>
                                            <FormControl><Input placeholder="e.g., Lagos Tech Hub" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                           
                             <FormField
                                control={form.control}
                                name="imageUrl"
                                render={() => (
                                <FormItem>
                                    <FormLabel>Customer Image</FormLabel>
                                    <div className="flex items-center gap-4">
                                        {imageUrl && (
                                            <Image
                                                src={imageUrl}
                                                alt="Customer image preview"
                                                width={80}
                                                height={80}
                                                className="rounded-full aspect-square object-cover"
                                            />
                                        )}
                                        <label className={cn(
                                            "flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted transition",
                                            isUploading && "opacity-50 cursor-not-allowed"
                                        )}>
                                            <div className="flex flex-col items-center justify-center text-center">
                                                {isUploading ? (
                                                    <LoaderCircle className="w-6 h-6 text-muted-foreground animate-spin"/>
                                                ) : (
                                                    <UploadCloud className="w-6 h-6 text-muted-foreground"/>
                                                )}
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                     {isUploading ? 'Uploading...' : 'Click to upload'}
                                                </p>
                                            </div>
                                            <Input 
                                                id="imageUpload"
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleFileUpload}
                                                disabled={isUploading}
                                            />
                                        </label>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="quote"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Quote</FormLabel>
                                        <FormControl>
                                            <Textarea 
                                                placeholder="The full testimonial text..." 
                                                {...field} 
                                                rows={5}
                                                maxLength={MAX_QUOTE_LENGTH}
                                            />
                                        </FormControl>
                                        <FormDescription className="text-right">
                                            {quoteValue.length} / {MAX_QUOTE_LENGTH}
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid sm:grid-cols-2 gap-6 items-center">
                                <FormField
                                    control={form.control}
                                    name="rating"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Rating</FormLabel>
                                            <FormControl>
                                                <div className="flex items-center gap-1" onMouseLeave={() => setHoverRating(0)}>
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star
                                                            key={star}
                                                            className={cn(
                                                                'h-6 w-6 cursor-pointer',
                                                                (hoverRating || currentRating) >= star
                                                                ? 'text-yellow-400 fill-yellow-400'
                                                                : 'text-gray-300'
                                                            )}
                                                            onMouseEnter={() => setHoverRating(star)}
                                                            onClick={() => field.onChange(star)}
                                                        />
                                                    ))}
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                 <FormField
                                    control={form.control}
                                    name="visible"
                                    render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                        <div className="space-y-0.5">
                                            <FormLabel>Visible on Homepage</FormLabel>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </form>
        </Form>
    );
}
