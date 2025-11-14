
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { LoaderCircle, Calendar as CalendarIcon, UploadCloud } from 'lucide-react';
import { useFirestore, addDocumentNonBlocking, useStorage } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import Image from 'next/image';

const promoSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  description: z.string().min(10, 'Description is too short.'),
  ctaText: z.string().min(2, 'CTA text is required.'),
  ctaLink: z.string().min(1, 'Please enter a link.'),
  imageUrl: z.string().url('Please enter a valid image URL.').optional().or(z.literal('')),
  backgroundColor: z.string().optional(),
  placement: z.enum(['popup', 'top-banner']).default('popup'),
  active: z.boolean().default(false),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

export default function NewPromoPage() {
    const firestore = useFirestore();
    const storage = useStorage();
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [promoId] = useState(() => doc(collection(firestore, 'promos')).id);

    const form = useForm<z.infer<typeof promoSchema>>({
        resolver: zodResolver(promoSchema),
        defaultValues: {
            title: '',
            description: '',
            ctaText: '',
            ctaLink: '',
            imageUrl: '',
            backgroundColor: '#ffffff',
            placement: 'popup',
            active: false,
        },
    });

    const imageUrl = form.watch('imageUrl');

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!storage || !event.target.files || event.target.files.length === 0) return;
        const file = event.target.files[0];
        setIsUploading(true);

        const MAX_MB = 5;
        if (file.size > MAX_MB * 1024 * 1024) {
            setIsUploading(false);
            toast({ variant: 'destructive', title: 'File too large', description: `Max file size is ${MAX_MB}MB.` });
            return;
        }

        const path = `promos/${promoId}/${file.name}`;
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
                form.setValue('imageUrl', downloadURL);
                setIsUploading(false);
                toast({ title: 'Image Uploaded', description: 'Image is ready to be saved.' });
            }
        );
    };

    const onSubmit = async (values: z.infer<typeof promoSchema>) => {
        if (!firestore) return;
        setIsSubmitting(true);
        
        try {
            const promosCollection = collection(firestore, 'promos');
            await addDocumentNonBlocking(promosCollection, { ...values, id: promoId });
            
            toast({ title: 'Promotion Created', description: `The "${values.title}" promotion has been created.` });
            router.push('/admin/promos');

        } catch (error) {
            console.error("Error creating promotion:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not create the promotion.' });
            setIsSubmitting(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">New Promotion</h1>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" type="button" onClick={() => router.push('/admin/promos')}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting || isUploading}>
                            {(isSubmitting || isUploading) && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            Save Promotion
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Promotion Details</CardTitle>
                        <CardDescription>Fill in the content and settings for your new promotion.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                         <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl><Input placeholder="e.g., Summer Sale!" {...field} /></FormControl>
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
                                    <FormControl><Textarea placeholder="Get 20% off all business cards..." {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid sm:grid-cols-2 gap-6">
                             <FormField
                                control={form.control}
                                name="ctaText"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Button Text</FormLabel>
                                        <FormControl><Input placeholder="e.g., Shop Now" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="ctaLink"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Button Link</FormLabel>
                                        <FormControl><Input placeholder="/products/your-product" {...field} /></FormControl>
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
                                    <FormLabel>Image (Optional)</FormLabel>
                                    <div className="flex items-center gap-4">
                                        {imageUrl && (
                                            <Image
                                                src={imageUrl}
                                                alt="Promotion image preview"
                                                width={120}
                                                height={90}
                                                className="rounded-md aspect-video object-cover"
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
                            name="backgroundColor"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Background Color (Optional)</FormLabel>
                                    <div className="flex items-center gap-2">
                                        <FormControl>
                                            <Input type="color" className="w-12 h-10 p-1" {...field} />
                                        </FormControl>
                                        <Input placeholder="#ffffff" {...field} value={field.value} onChange={e => field.onChange(e.target.value)} />
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <div className="grid sm:grid-cols-2 gap-6">
                             <FormField
                                control={form.control}
                                name="startDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Start Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                                >
                                                {field.value ? (
                                                    format(field.value, "PPP")
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                initialFocus
                                            />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="endDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>End Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                                >
                                                {field.value ? (
                                                    format(field.value, "PPP")
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                initialFocus
                                            />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="grid sm:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="placement"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Placement</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="popup">Popup</SelectItem>
                                                <SelectItem value="top-banner">Top Banner</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="active"
                                render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                    <div className="space-y-0.5">
                                        <FormLabel>Activate Promotion</FormLabel>
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
            </form>
        </Form>
    );
}

    