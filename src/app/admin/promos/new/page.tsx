
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { LoaderCircle, Calendar as CalendarIcon, UploadCloud, Palette } from 'lucide-react';
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
import Link from 'next/link';

const promoSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  description: z.string().min(10, 'Description is too short.'),
  ctaText: z.string().min(2, 'CTA text is required.'),
  ctaLink: z.string().min(1, 'Please enter a link.'),
  imageUrl: z.string().url('Please enter a valid image URL.').optional().or(z.literal('')),
  backgroundColor: z.string().optional().default('#ffffff'),
  titleColor: z.string().optional().default('#000000'),
  descriptionColor: z.string().optional().default('#666666'),
  ctaBackgroundColor: z.string().optional().default('#3b82f6'),
  ctaTextColor: z.string().optional().default('#ffffff'),
  placement: z.enum(['popup', 'top-banner']).default('popup'),
  active: z.boolean().default(false),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  displayIntervalHours: z.coerce.number().optional(),
  autoDismissSeconds: z.coerce.number().optional(),
});

type PromoFormValues = z.infer<typeof promoSchema>;


function ColorPickerInput({ field, label }: { field: any, label: string }) {
    return (
        <FormItem>
            <FormLabel>{label}</FormLabel>
            <div className="flex items-center gap-2">
                <FormControl>
                    <Input type="color" className="w-12 h-10 p-1" {...field} />
                </FormControl>
                <Input placeholder="#ffffff" {...field} onChange={e => field.onChange(e.target.value)} />
            </div>
            <FormMessage />
        </FormItem>
    );
}

function LivePreview({ formData }: { formData: Partial<PromoFormValues> }) {
    const { title, description, ctaText, ctaLink, imageUrl, backgroundColor, titleColor, descriptionColor, ctaBackgroundColor, ctaTextColor } = formData;

    return (
        <Card>
            <CardHeader><CardTitle>Live Preview</CardTitle></CardHeader>
            <CardContent>
                <div className="relative overflow-hidden rounded-lg border">
                    <div style={{ backgroundColor: backgroundColor || '#ffffff' }} className="p-8">
                        <h3 style={{ color: titleColor || '#000000' }} className="text-2xl font-bold">{title || 'Your Title Here'}</h3>
                        <p style={{ color: descriptionColor || '#666666' }} className="mt-2">{description || 'Your descriptive text will appear here.'}</p>
                        <Button 
                            asChild 
                            style={{ backgroundColor: ctaBackgroundColor || '#3b82f6', color: ctaTextColor || '#ffffff' }}
                            className="mt-6"
                        >
                           <Link href={ctaLink || '#'}>{ctaText || 'Button'}</Link>
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}


export default function NewPromoPage() {
    const firestore = useFirestore();
    const storage = useStorage();
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [promoId] = useState(() => doc(collection(firestore, 'promos')).id);

    const form = useForm<PromoFormValues>({
        resolver: zodResolver(promoSchema),
        defaultValues: {
            title: '',
            description: '',
            ctaText: '',
            ctaLink: '',
            imageUrl: '',
            backgroundColor: '#ffffff',
            titleColor: '#111827',
            descriptionColor: '#4b5563',
            ctaBackgroundColor: '#2563eb',
            ctaTextColor: '#ffffff',
            placement: 'popup',
            active: false,
            displayIntervalHours: 24,
            autoDismissSeconds: 0,
        },
    });

    const watchedData = form.watch();
    const imageUrl = form.watch('imageUrl');
    const placement = form.watch('placement');

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

    const onSubmit = async (values: PromoFormValues) => {
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
                 <div className="grid lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2 space-y-8">
                        <Card>
                            <CardHeader><CardTitle>Promotion Content</CardTitle></CardHeader>
                            <CardContent className="space-y-6">
                                <FormField name="title" control={form.control} render={({ field }) => (
                                    <FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="e.g., Summer Sale!" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField name="description" control={form.control} render={({ field }) => (
                                    <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Get 20% off all business cards..." {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <div className="grid sm:grid-cols-2 gap-6">
                                    <FormField name="ctaText" control={form.control} render={({ field }) => (
                                        <FormItem><FormLabel>Button Text</FormLabel><FormControl><Input placeholder="e.g., Shop Now" {...field} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                    <FormField name="ctaLink" control={form.control} render={({ field }) => (
                                        <FormItem><FormLabel>Button Link</FormLabel><FormControl><Input placeholder="/products/your-product" {...field} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                </div>
                                <FormField name="imageUrl" control={form.control} render={() => (
                                    <FormItem>
                                        <FormLabel>Image (Optional)</FormLabel>
                                        <div className="flex items-center gap-4">
                                            {imageUrl && <Image src={imageUrl} alt="Preview" width={120} height={90} className="rounded-md aspect-video object-cover"/>}
                                            <label className={cn("flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted transition", isUploading && "opacity-50 cursor-not-allowed")}>
                                                <div className="flex flex-col items-center justify-center text-center">
                                                    {isUploading ? <LoaderCircle className="w-6 h-6 text-muted-foreground animate-spin"/> : <UploadCloud className="w-6 h-6 text-muted-foreground"/>}
                                                    <p className="mt-1 text-xs text-muted-foreground">{isUploading ? 'Uploading...' : 'Click to upload'}</p>
                                                </div>
                                                <Input id="imageUpload" type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={isUploading}/>
                                            </label>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle>Styling</CardTitle><CardDescription>Customize the look and feel.</CardDescription></CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <FormField name="backgroundColor" control={form.control} render={({ field }) => <ColorPickerInput field={field} label="Background Color" />} />
                                    <FormField name="titleColor" control={form.control} render={({ field }) => <ColorPickerInput field={field} label="Title Color" />} />
                                    <FormField name="descriptionColor" control={form.control} render={({ field }) => <ColorPickerInput field={field} label="Description Color" />} />
                                </div>
                                <div className="grid sm:grid-cols-2 gap-6">
                                    <FormField name="ctaBackgroundColor" control={form.control} render={({ field }) => <ColorPickerInput field={field} label="Button Background" />} />
                                    <FormField name="ctaTextColor" control={form.control} render={({ field }) => <ColorPickerInput field={field} label="Button Text Color" />} />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle>Rules & Placement</CardTitle></CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid sm:grid-cols-2 gap-6">
                                    <FormField name="startDate" control={form.control} render={({ field }) => (
                                        <FormItem className="flex flex-col"><FormLabel>Start Date</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>
                                    )}/>
                                    <FormField name="endDate" control={form.control} render={({ field }) => (
                                        <FormItem className="flex flex-col"><FormLabel>End Date</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>
                                    )}/>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-6">
                                    <FormField name="placement" control={form.control} render={({ field }) => (
                                        <FormItem><FormLabel>Placement</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="popup">Popup</SelectItem><SelectItem value="top-banner">Top Banner</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                                    )}/>
                                    <FormField name="active" control={form.control} render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 mt-8"><FormLabel>Activate</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
                                    )}/>
                                </div>
                                {placement === 'popup' && <FormField name="displayIntervalHours" control={form.control} render={({ field }) => (<FormItem><FormLabel>Popup Display Interval (Hours)</FormLabel><FormControl><Input type="number" placeholder="e.g., 24" {...field} /></FormControl><FormMessage /></FormItem>)}/>}
                                {placement === 'top-banner' && <FormField name="autoDismissSeconds" control={form.control} render={({ field }) => (<FormItem><FormLabel>Banner Auto-Dismiss (Seconds)</FormLabel><FormControl><Input type="number" placeholder="0 for no auto-dismiss" {...field} /></FormControl><FormMessage /></FormItem>)}/>}
                            </CardContent>
                        </Card>
                    </div>
                    <div className="lg:col-span-1 space-y-6 sticky top-24">
                        <LivePreview formData={watchedData} />
                    </div>
                </div>
            </form>
        </Form>
    );
}
