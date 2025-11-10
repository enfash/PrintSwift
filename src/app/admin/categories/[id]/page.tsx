
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

const categorySchema = z.object({
  name: z.string().min(3, 'Category name must be at least 3 characters.'),
  description: z.string().optional(),
});


export default function CategoryEditPage({ params: { id } }: { params: { id: string } }) {
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const categoryRef = useMemoFirebase(() => firestore ? doc(firestore, 'product_categories', id) : null, [firestore, id]);
    const { data: category, isLoading: isLoadingCategory } = useDoc<z.infer<typeof categorySchema>>(categoryRef);

    const form = useForm<z.infer<typeof categorySchema>>({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            name: '',
            description: '',
        }
    });

    useEffect(() => {
        if (category) {
            form.reset({
                ...category,
                description: category.description || '', // Ensure description is not undefined
            });
        }
    }, [category, form]);
    
    const onSubmit = async (values: z.infer<typeof categorySchema>) => {
        if (!firestore) return;
        setIsSubmitting(true);
        
        try {
            const categoryDocRef = doc(firestore, 'product_categories', id);
            updateDocumentNonBlocking(categoryDocRef, values);
            toast({ title: 'Category Updated', description: `Category "${values.name}" has been successfully updated.` });
            router.push('/admin/categories');
        } catch (error) {
            console.error("Error updating category:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not update the category.' });
            setIsSubmitting(false);
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
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
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
                        </CardContent>
                    </Card>
                </div>
            </form>
        </Form>
    );
}
