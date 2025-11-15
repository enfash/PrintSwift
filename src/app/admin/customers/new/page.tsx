
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoaderCircle } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import CustomerForm from '@/components/admin/customers/CustomerForm';
import { createCustomer } from '@/lib/firebase/customers';
import type { CustomerFormValues } from '@/components/admin/customers/CustomerForm';

export default function NewCustomerPage() {
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const onSubmit = async (values: CustomerFormValues) => {
        if (!firestore) return;
        setIsSubmitting(true);
        
        try {
            await createCustomer(firestore, values);
            toast({ title: 'Customer Created', description: `${values.name} has been successfully added.` });
            router.push('/admin/customers');

        } catch (error) {
            console.error("Error creating customer:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not create the customer.' });
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Add New Customer</h1>
                <div className="flex items-center gap-2">
                    <Button variant="outline" type="button" onClick={() => router.push('/admin/customers')}>Cancel</Button>
                    <Button type="submit" form="customer-form" disabled={isSubmitting}>
                        {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                        Save Customer
                    </Button>
                </div>
            </div>

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Customer Details</CardTitle>
                    <CardDescription>Fill in the information for your new customer.</CardDescription>
                </CardHeader>
                <CardContent>
                    <CustomerForm id="customer-form" onSubmit={onSubmit} />
                </CardContent>
            </Card>
        </>
    );
}

    