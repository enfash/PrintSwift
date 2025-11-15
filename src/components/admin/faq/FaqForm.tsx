
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { LoaderCircle } from 'lucide-react';

const faqSchema = z.object({
  question: z.string().min(10, 'Question must be at least 10 characters.'),
  answer: z.string().min(10, 'Answer must be at least 10 characters.'),
  category: z.string().min(2, 'Category is required.'),
  visible: z.boolean().default(true),
});

type FaqFormValues = z.infer<typeof faqSchema>;

interface FaqFormProps {
  onFinished: () => void;
  currentFaq?: any;
}

export default function FaqForm({ onFinished, currentFaq }: FaqFormProps) {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<FaqFormValues>({
        resolver: zodResolver(faqSchema),
        defaultValues: currentFaq || {
            question: '',
            answer: '',
            category: 'General',
            visible: true,
        }
    });

    const onSubmit = async (values: FaqFormValues) => {
        if (!firestore) return;
        setIsSubmitting(true);

        try {
            if (currentFaq?.id) {
                const faqDocRef = doc(firestore, 'faqs', currentFaq.id);
                await updateDoc(faqDocRef, values);
                toast({ title: 'FAQ Updated' });
            } else {
                const faqsCollection = collection(firestore, 'faqs');
                const newDocRef = doc(faqsCollection);
                await addDoc(faqsCollection, { ...values, id: newDocRef.id });
                toast({ title: 'FAQ Created' });
            }
            onFinished();
        } catch (error) {
            console.error("Error saving FAQ:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not save the FAQ.' });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const title = currentFaq ? 'Edit FAQ' : 'Add New FAQ';

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        Fill in the details for the frequently asked question.
                    </DialogDescription>
                </DialogHeader>
                <FormField
                    control={form.control}
                    name="question"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Question</FormLabel>
                            <FormControl><Input placeholder="e.g., What is your turnaround time?" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="answer"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Answer</FormLabel>
                            <FormControl><Textarea rows={5} placeholder="Our standard turnaround is..." {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="grid grid-cols-2 gap-6">
                     <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Category</FormLabel>
                                <FormControl><Input placeholder="e.g., Shipping" {...field} /></FormControl>
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
                                    <FormLabel>Visible</FormLabel>
                                </div>
                                <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                    Save FAQ
                </Button>
            </form>
        </Form>
    );
}
