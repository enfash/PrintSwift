
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { LoaderCircle } from 'lucide-react';
import { useDoc, useFirestore, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useEffect, useState } from 'react';
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

export default function EditPromoPage({ params }: { params: { id: string } }) {
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();
    
    const promoRef = useMemoFirebase(() => firestore ? doc(firestore, 'promos', params.id) : null, [firestore, params.id]);
    const { data: promo, isLoading } = useDoc<z.infer<typeof promoSchema>>(promoRef);

    const form = useForm<z.infer<typeof promoSchema>>({
        resolver: zodResolver(promoSchema),
    });

    useEffect(() => {
        if (promo) {
            form.reset({
                ...promo,
                imageUrl: promo.imageUrl || '',
            });
        }
    }, [promo, form]);
    
    const onSubmit = async (values: z.infer<typeof promoSchema>) => {
        if (!firestore) return;
        
        try {
            const promoDocRef = doc(firestore, 'promos', params.id);
            await updateDocumentNonBlocking(promoDocRef, values);
            
            toast({ title: 'Promotion Updated', description: `The "${values.title}" promotion has been updated.` });
            router.push('/admin/promos');

        } catch (error) {
            console.error("Error updating promotion:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not update the promotion.' });
        }
    };
    
    const isSubmitting = form.formState.isSubmitting;

    if (isLoading) {
        return <div className="flex h-96 items-center justify-center"><LoaderCircle className="h-8 w-8 animate-spin" /></div>;
    }

    if (!promo) {
        return <div className="flex h-96 items-center justify-center"><p>Promotion not found.</p></div>;
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">Edit Promotion</h1>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" type="button" onClick={() => router.push('/admin/promos')}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Promotion Details</CardTitle>
                        <CardDescription>Update the content and settings for your promotion.</CardDescription>
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
                                    <FormControl><Input placeholder="https://.../image.png" {...field} value={field.value || ''} /></FormControl>
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
