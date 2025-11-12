
'use client';

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar as CalendarIcon, PlusCircle, Trash2, Copy, LoaderCircle } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';

const lineItemSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  productName: z.string(),
  qty: z.coerce.number().min(1, 'Qty must be at least 1'),
  options: z.string().optional(),
  unitPrice: z.coerce.number().min(0, 'Unit price must be positive'),
});

const quoteSchema = z.object({
  customerId: z.string().optional(),
  company: z.string().optional(),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  dueDate: z.date().optional(),
  status: z.enum(['draft', 'sent', 'won', 'lost']).default('draft'),
  lineItems: z.array(lineItemSchema).min(1, 'At least one line item is required.'),
  notesCustomer: z.string().optional(),
  notesInternal: z.string().optional(),
  discount: z.coerce.number().default(0),
  vatRate: z.coerce.number().default(7.5),
  delivery: z.coerce.number().default(0),
});

type QuoteFormValues = z.infer<typeof quoteSchema>;

export default function NewQuotePage() {
  const { toast } = useToast();
  const firestore = useFirestore();

  const productsRef = useMemoFirebase(() => firestore ? collection(firestore, 'products') : null, [firestore]);
  const { data: products, isLoading: isLoadingProducts } = useCollection<any>(productsRef);
  
  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      status: 'draft',
      lineItems: [],
      discount: 0,
      vatRate: 7.5,
      delivery: 5000,
    },
  });

  const { fields, append, remove, copy } = useFieldArray({
    control: form.control,
    name: 'lineItems',
  });

  const watchLineItems = form.watch('lineItems');
  const watchDiscount = form.watch('discount');
  const watchVatRate = form.watch('vatRate');
  const watchDelivery = form.watch('delivery');

  const [summary, setSummary] = useState({ subtotal: 0, vat: 0, total: 0 });

  const calculateSummary = () => {
    const subtotal = watchLineItems.reduce((acc, item) => acc + (item.qty * item.unitPrice), 0);
    const discountedTotal = subtotal - watchDiscount;
    const vat = discountedTotal * (watchVatRate / 100);
    const total = discountedTotal + vat + watchDelivery;
    setSummary({ subtotal, vat, total });
  };

  useEffect(() => {
    calculateSummary();
  }, [watchLineItems, watchDiscount, watchVatRate, watchDelivery]);


  const handleAddProduct = () => {
    append({ productId: '', productName: '', qty: 1, options: '', unitPrice: 0 });
  };
  
  const handleProductChange = (index: number, productId: string) => {
    const product = products?.find(p => p.id === productId);
    if (product) {
        form.setValue(`lineItems.${index}.productName`, product.name);
        const price = product.pricing?.tiers?.[0]?.unitCost || 0;
        form.setValue(`lineItems.${index}.unitPrice`, price);
    }
  };
  
  const showNotImplementedToast = (feature: string) => {
    toast({
        title: 'Coming Soon!',
        description: `${feature} functionality is not yet implemented.`
    });
  };
  
  const onSubmit = (data: QuoteFormValues) => {
      console.log('Quote Data:', data);
      showNotImplementedToast('Saving quote');
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">New Quote</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" type="button" onClick={() => showNotImplementedToast('Save Draft')}>Save Draft</Button>
          <Button type="submit">Submit</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="col-span-1 space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Customer & Job Info</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <Label htmlFor="customer">Customer</Label>
                <Select onValueChange={(value) => form.setValue('customerId', value)}>
                  <SelectTrigger id="customer">
                    <SelectValue placeholder="Search/Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new-customer">-- Create New Customer --</SelectItem>
                    <SelectItem value="ada-ventures">Ada Ventures</SelectItem>
                    <SelectItem value="jide-stores">Jide Stores</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Input placeholder="Company (auto from customer)" {...form.register('company')} />
              <Input placeholder="Email (auto/override)" {...form.register('email')} />
              <Input placeholder="Phone (auto/override)" {...form.register('phone')} />
              
               <Controller
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant={'outline'} className={cn('w-full justify-start text-left font-normal', !field.value && "text-muted-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? format(field.value, "PPP") : <span>Pick a due date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent>
                    </Popover>
                )}
              />

              <Controller
                control={form.control}
                name="status"
                render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="sent">Sent</SelectItem>
                        <SelectItem value="won">Won</SelectItem>
                        <SelectItem value="lost">Lost</SelectItem>
                      </SelectContent>
                    </Select>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Line Items</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="w-24">Qty</TableHead>
                    <TableHead>Options</TableHead>
                    <TableHead className="w-32 text-right">Unit ₦</TableHead>
                    <TableHead className="w-32 text-right">Sum</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell>
                         <Controller
                            control={form.control}
                            name={`lineItems.${index}.productId`}
                            render={({ field }) => (
                                <Select onValueChange={(value) => {field.onChange(value); handleProductChange(index, value);}} value={field.value}>
                                    <SelectTrigger><SelectValue placeholder="Select product..."/></SelectTrigger>
                                    <SelectContent>
                                        {isLoadingProducts ? <LoaderCircle className="animate-spin" /> :
                                            products?.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)
                                        }
                                    </SelectContent>
                                </Select>
                            )}
                        />
                      </TableCell>
                       <TableCell><Input type="number" {...form.register(`lineItems.${index}.qty`)} /></TableCell>
                      <TableCell><Input placeholder="e.g. Matte, RC" {...form.register(`lineItems.${index}.options`)} /></TableCell>
                      <TableCell><Input type="number" className="text-right" {...form.register(`lineItems.${index}.unitPrice`)} /></TableCell>
                      <TableCell className="text-right">{(watchLineItems[index].qty * watchLineItems[index].unitPrice).toLocaleString()}</TableCell>
                      <TableCell>
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4 flex items-center gap-2">
                <Button variant="outline" size="sm" type="button" onClick={handleAddProduct}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Product
                </Button>
                 <Button variant="ghost" size="sm" type="button" onClick={() => showNotImplementedToast('Duplicate item')}>
                  <Copy className="mr-2 h-4 w-4" /> Duplicate
                </Button>
              </div>
               {form.formState.errors.lineItems && <p className="text-sm font-medium text-destructive mt-2">{form.formState.errors.lineItems.message}</p>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="notes-customer">Notes to Customer</Label>
                <Textarea id="notes-customer" {...form.register('notesCustomer')} />
              </div>
              <div>
                <Label htmlFor="notes-internal">Internal Notes</Label>
                <Textarea id="notes-internal" {...form.register('notesInternal')} />
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Right Column */}
        <div className="col-span-1 space-y-6">
          <Card className="sticky top-24">
            <CardHeader><CardTitle>Quote Summary</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₦ {summary.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Discount</span>
                <Input className="h-8 max-w-24 text-right" {...form.register('discount')} />
              </div>
               <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Delivery</span>
                <Input className="h-8 max-w-24 text-right" {...form.register('delivery')} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">VAT (%)</span>
                <Input className="h-8 max-w-24 text-right" {...form.register('vatRate')} />
              </div>
              <Separator />
               <div className="flex justify-between">
                <span className="text-muted-foreground">VAT Amount</span>
                <span>₦ {summary.vat.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>TOTAL</span>
                <span>₦ {summary.total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
              <Separator />
              <div className="flex gap-2">
                <Button type="button" variant="outline" className="w-full" onClick={calculateSummary}>Recalculate</Button>
                <Button type="button" variant="outline" className="w-full" onClick={() => showNotImplementedToast('Add Deposit')}>Add Deposit %</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
       <Card className="fixed bottom-0 left-0 right-0 border-t rounded-none sm:left-[var(--sidebar-width-icon)] group-data-[state=expanded]/sidebar-wrapper:sm:left-[var(--sidebar-width)] transition-all duration-300 ease-in-out">
            <CardContent className="p-4 flex items-center justify-end gap-2">
                <Button type="button" variant="secondary" onClick={() => showNotImplementedToast('Send Quote Email')}>Send Quote Email</Button>
                <Button type="button" variant="secondary" onClick={() => showNotImplementedToast('Generate PDF')}>Generate PDF</Button>
                <Button type="button" onClick={() => showNotImplementedToast('Convert to Order')}>Convert to Order</Button>
                <Button type="button" variant="ghost" className="text-muted-foreground" onClick={() => showNotImplementedToast('Archive')}>Archive</Button>
            </CardContent>
        </Card>
    </form>
  );
}
