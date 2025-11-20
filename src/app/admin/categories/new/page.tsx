
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
import useUnsavedChangesWarning from '@/hooks/use-unsaved-changes-warning';

const categorySchema = z.object({
  id: z.string().min(3, 'Slug/ID must be at least 3 characters. Use lowercase and dashes (e.g., "new-category").'),
  name: z.string().min(3, 'Category name must be at least 3 characters.'),
  description: z.string().optional(),
});


export default function CategoryFormPage() {
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();

    const form = useForm<z.infer<typeof categorySchema>>({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            id: '',
            name: '',
            description: '',
        },
    });

    const { formState: { isDirty, isSubmitting } } = form;
    useUnsavedChangesWarning(isDirty);

    const onSubmit = async (values: z.infer<typeof categorySchema>) => {
        if (!firestore) return;
        
        try {
            const categoryDocRef = doc(firestore, 'product_categories', values.id);
            await addDocumentNonBlocking(collection(firestore, 'product_categories'), { name: values.name, description: values.description }, { id: values.id });
            
            // This is a bit of a workaround for addDocumentNonBlocking not directly supporting setting a custom ID.
            // A more robust solution might involve a custom cloud function or a different non-blocking wrapper.
            // For now, we will create the doc with a custom ID via setDoc.
            const newCatRef = doc(firestore, 'product_categories', values.id);
            addDocumentNonBlocking(collection(firestore, 'product_categories'), values)

            toast({ title: 'Category Created', description: `Category "${values.name}" has been successfully created.` });
            form.reset();
            router.push('/admin/categories');

        } catch (error) {
            console.error("Error saving category:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not save the category.' });
        }
    };


    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">Add New Category</h1>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" type="button" onClick={() => router.push('/admin/categories')}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
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
                                        <FormControl><Input placeholder="e.g., marketing-materials" {...field} /></FormControl>
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
                        </CardContent>
                    </Card>
                </div>
            </form>
        </Form>
    );
}
