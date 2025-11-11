
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { LoaderCircle, Star } from 'lucide-react';
import { useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';

const testimonialSchema = z.object({
  name: z.string().min(2, 'Name is required.'),
  company: z.string().optional(),
  location: z.string().optional(),
  quote: z.string().min(10, 'Testimonial text is too short.'),
  rating: z.number().min(1).max(5),
  visible: z.boolean().default(true),
});

export default function NewTestimonialPage() {
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hoverRating, setHoverRating] = useState(0);

    const form = useForm<z.infer<typeof testimonialSchema>>({
        resolver: zodResolver(testimonialSchema),
        defaultValues: {
            name: '',
            company: '',
            location: '',
            quote: '',
            rating: 5,
            visible: true,
        },
    });
    
    const currentRating = form.watch('rating');

    const onSubmit = async (values: z.infer<typeof testimonialSchema>) => {
        if (!firestore) return;
        setIsSubmitting(true);
        
        try {
            const testimonialsCollection = collection(firestore, 'testimonials');
            await addDocumentNonBlocking(testimonialsCollection, values);
            
            toast({ title: 'Testimonial Created', description: `The new testimonial has been added.` });
            router.push('/admin/testimonials');

        } catch (error) {
            console.error("Error saving testimonial:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not save the testimonial.' });
            setIsSubmitting(false);
        }
    };


    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">Add New Testimonial</h1>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" type="button" onClick={() => router.push('/admin/testimonials')}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
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
                                            <FormLabel>Company / Location</FormLabel>
                                            <FormControl><Input placeholder="e.g., Lagos Tech Hub" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="quote"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Quote</FormLabel>
                                        <FormControl><Textarea placeholder="The full testimonial text..." {...field} rows={5}/></FormControl>
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
