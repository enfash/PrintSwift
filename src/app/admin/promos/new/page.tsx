
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { LoaderCircle } from 'lucide-react';
import { useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const promoSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  description: z.string().min(10, 'Description is too short.'),
  ctaText: z.string().min(2, 'CTA text is required.'),
  ctaLink: z.string().url('Please enter a valid URL.'),
  imageUrl: z.string().url('Please enter a valid image URL.').optional().or(z.literal('')),
  placement: z.enum(['popup', 'top-banner']).default('popup'),
  active: z.boolean().default(false),
});

export default function NewPromoPage() {
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof promoSchema>>({
        resolver: zodResolver(promoSchema),
        defaultValues: {
            title: '',
            description: '',
            ctaText: '',
            ctaLink: '',
            imageUrl: '',
            placement: 'popup',
            active: false,
        },
    });

    const onSubmit = async (values: z.infer<typeof promoSchema>) => {
        if (!firestore) return;
        setIsSubmitting(true);
        
        try {
            const promosCollection = collection(firestore, 'promos');
            const newDocRef = doc(promosCollection);
            await addDocumentNonBlocking(promosCollection, { ...values, id: newDocRef.id });
            
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
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
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
                                        <FormControl><Input placeholder="https://..." {...field} /></FormControl>
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
                                    <FormLabel>Image URL (Optional)</FormLabel>
                                    <FormControl><Input placeholder="https://.../image.png" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
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
