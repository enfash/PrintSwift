
'use client';

import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoaderCircle } from 'lucide-react';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState, use } from 'react';
import CustomerForm, { type CustomerFormValues } from '@/components/admin/customers/CustomerForm';
import { updateCustomer } from '@/lib/firebase/customers';

export default function CustomerEditPage({ params }: { params: { id: string } }) {
    const { id } = use(params);
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const customerRef = useMemoFirebase(() => firestore ? doc(firestore, 'customers', id) : null, [firestore, id]);
    const { data: customer, isLoading: isLoadingCustomer } = useDoc<CustomerFormValues>(customerRef);

    const form = useForm<CustomerFormValues>();

    useEffect(() => {
        if (customer) {
            form.reset({
                ...customer,
                company: customer.company || '',
                notes: customer.notes || '',
                phone: customer.phone || ''
            });
        }
    }, [customer, form]);
    
    const onSubmit = async (values: CustomerFormValues) => {
        if (!firestore) return;
        setIsSubmitting(true);
        
        try {
            await updateCustomer(firestore, id, values);
            toast({ title: 'Customer Updated', description: `Customer "${values.name}" has been successfully updated.` });
            router.push('/admin/customers');
        } catch (error) {
            console.error("Error updating customer:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not update the customer.' });
            setIsSubmitting(false);
        }
    };

    if (isLoadingCustomer) {
        return <div className="flex h-96 items-center justify-center"><LoaderCircle className="h-8 w-8 animate-spin" /></div>;
    }
    
    if (!customer) {
        return <div className="text-center py-10">Customer not found.</div>
    }

    return (
        <>
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Edit Customer</h1>
                <div className="flex items-center gap-2">
                    <Button variant="outline" type="button" onClick={() => router.push('/admin/customers')}>Cancel</Button>
                    <Button type="submit" form="customer-form" disabled={isSubmitting}>
                        {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </div>
            </div>
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Customer Details</CardTitle>
                </CardHeader>
                <CardContent>
                     <CustomerForm id="customer-form" onSubmit={onSubmit} initialValues={customer} />
                </CardContent>
            </Card>
        </>
    );
}
