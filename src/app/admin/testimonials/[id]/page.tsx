
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { LoaderCircle, Star, UploadCloud, Link2 } from 'lucide-react';
import { useDoc, useFirestore, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useEffect, useState, use } from 'react';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const MAX_QUOTE_LENGTH = 280;

const testimonialSchema = z.object({
  name: z.string().min(2, 'Name is required.'),
  company: z.string().optional(),
  quote: z.string().min(10, 'Testimonial text is too short.').max(MAX_QUOTE_LENGTH, `Testimonial must be ${MAX_QUOTE_LENGTH} characters or less.`),
  rating: z.number().min(1).max(5),
  visible: z.boolean().default(true),
  imageUrl: z.string().url().optional().or(z.literal('')),
});

export default function EditTestimonialPage({ params: paramsProp }: { params: { id: string } }) {
    const params = use(paramsProp);
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hoverRating, setHoverRating] = useState(0);

    const testimonialRef = useMemoFirebase(() => firestore ? doc(firestore, 'testimonials', params.id) : null, [firestore, params.id]);
    const { data: testimonial, isLoading } = useDoc<z.infer<typeof testimonialSchema>>(testimonialRef);

    const form = useForm<z.infer<typeof testimonialSchema>>({
        resolver: zodResolver(testimonialSchema),
    });

    useEffect(() => {
        if (testimonial) {
            form.reset({
                ...testimonial,
                company: testimonial.company || '',
                imageUrl: testimonial.imageUrl || '',
            });
        }
    }, [testimonial, form]);
    
    const currentRating = form.watch('rating');
    const quoteValue = form.watch('quote') || '';

    const onSubmit = async (values: z.infer<typeof testimonialSchema>) => {
        if (!firestore) return;
        setIsSubmitting(true);
        
        if (values.imageUrl && values.imageUrl.startsWith('blob:')) {
            toast({ variant: 'destructive', title: 'Temporary Image Detected', description: "Please replace the local image preview with a permanent URL before saving. The save operation was cancelled."});
            setIsSubmitting(false);
            return;
        }

        try {
            const testimonialDocRef = doc(firestore, 'testimonials', params.id);
            await updateDocumentNonBlocking(testimonialDocRef, values);
            
            toast({ title: 'Testimonial Updated', description: `The testimonial has been successfully updated.` });
            router.push('/admin/testimonials');

        } catch (error) {
            console.error("Error updating testimonial:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not update the testimonial.' });
            setIsSubmitting(false);
        }
    };
    
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const tempPreviewUrl = URL.createObjectURL(file);
            form.setValue('imageUrl', tempPreviewUrl);
            toast({ title: "Image Added", description: "This is a local preview. To save, replace it with a permanent URL using the Link tab."})
        }
    };

    const handleAddImageUrl = (url: string) => {
        try {
            z.string().url().parse(url);
            form.setValue('imageUrl', url);
            const input = document.getElementById('imageUrlInput') as HTMLInputElement;
            if (input) input.value = '';
        } catch {
            toast({ variant: 'destructive', title: "Invalid URL", description: "Please enter a valid image URL."});
        }
    }


    if (isLoading) {
        return <div className="flex h-96 items-center justify-center"><LoaderCircle className="h-8 w-8 animate-spin" /></div>;
    }

    if (!testimonial) {
        return <div className="flex h-96 items-center justify-center"><p>Testimonial not found.</p></div>;
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">Edit Testimonial</h1>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" type="button" onClick={() => router.push('/admin/testimonials')}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </div>
                </div>

                <div className="grid gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Testimonial Details</CardTitle>
                            <CardDescription>Update the customer's feedback.</CardDescription>
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
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Customer Image</FormLabel>
                                        <FormControl>
                                            <Tabs defaultValue="url" className="w-full">
                                                <TabsList className="grid w-full grid-cols-2">
                                                    <TabsTrigger value="upload"><UploadCloud className="mr-2 h-4 w-4"/>Upload</TabsTrigger>
                                                    <TabsTrigger value="url"><Link2 className="mr-2 h-4 w-4"/>Link</TabsTrigger>
                                                </TabsList>
                                                <TabsContent value="upload" className="pt-2">
                                                    <Input type="file" onChange={handleFileUpload} accept="image/*" />
                                                    <FormDescription className="text-xs mt-2">
                                                        Local previews must be replaced with a permanent URL before saving.
                                                    </FormDescription>
                                                </TabsContent>
                                                <TabsContent value="url" className="pt-2">
                                                    <div className="flex gap-2">
                                                        <Input 
                                                            id="imageUrlInput"
                                                            placeholder="https://..."
                                                            defaultValue={field.value}
                                                        />
                                                        <Button type="button" onClick={() => handleAddImageUrl((document.getElementById('imageUrlInput') as HTMLInputElement).value)}>Add</Button>
                                                    </div>
                                                </TabsContent>
                                            </Tabs>
                                        </FormControl>
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
