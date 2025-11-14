
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export const customerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  company: z.string().optional(),
  notes: z.string().optional(),
});
export type CustomerFormValues = z.infer<typeof customerSchema>;

interface CustomerFormProps {
    id?: string;
    initialValues?: Partial<CustomerFormValues>;
    onSubmit: (values: CustomerFormValues) => void;
}

export default function CustomerForm({ id, initialValues, onSubmit }: CustomerFormProps) {
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: initialValues?.name || '',
      email: initialValues?.email || '',
      phone: initialValues?.phone || '',
      company: initialValues?.company || '',
      notes: initialValues?.notes || '',
    }
  });

  return (
    <Form {...form}>
      <form id={id} onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid sm:grid-cols-2 gap-6">
            <FormField name="name" control={form.control} render={({ field }) => (
            <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl><Input {...field} placeholder="e.g., John Doe" /></FormControl>
                <FormMessage />
            </FormItem>
            )} />
            <FormField name="company" control={form.control} render={({ field }) => (
            <FormItem>
                <FormLabel>Company (optional)</FormLabel>
                <FormControl><Input {...field} placeholder="e.g., Acme Inc." /></FormControl>
                <FormMessage />
            </FormItem>
            )} />
        </div>
        <div className="grid sm:grid-cols-2 gap-6">
            <FormField name="email" control={form.control} render={({ field }) => (
            <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl><Input {...field} type="email" placeholder="e.g., john.doe@example.com" /></FormControl>
                <FormMessage />
            </FormItem>
            )} />
            <FormField name="phone" control={form.control} render={({ field }) => (
            <FormItem>
                <FormLabel>Phone / WhatsApp</FormLabel>
                <FormControl><Input {...field} placeholder="e.g., +234 800 000 0000" /></FormControl>
                <FormMessage />
            </FormItem>
            )} />
        </div>
        <FormField name="notes" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>Internal Notes</FormLabel>
            <FormControl><Textarea {...field} placeholder="Add any relevant notes about the customer..." /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
      </form>
    </Form>
  );
}
