
'use client';

import React, { useState, useEffect, useCallback } from 'react';
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

const lineItemOptionSchema = z.object({
  label: z.string(),
  value: z.string(),
});

const lineItemSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  productName: z.string(),
  productDetails: z.any().optional(), // To store the full product data
  qty: z.coerce.number().min(1, 'Qty must be at least 1'),
  options: z.array(lineItemOptionSchema).optional(),
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

  const calculateLineItemPrice = useCallback((item: any) => {
    if (!item.productDetails || !item.productDetails.pricing || !item.productDetails.pricing.tiers) {
        return 0;
    }
  
    const tier = item.productDetails.pricing.tiers
      .slice()
      .sort((a: any, b: any) => b.minQty - a.minQty)
      .find((t: any) => item.qty >= t.minQty);
  
    if (!tier) return 0;
  
    let { unitCost = 0 } = tier;
    
    let optionsCost = 0;
    let numberInputMultiplier = 1;
  
    if (item.options && item.productDetails.details) {
        item.options.forEach((selectedOpt: any) => {
            const detail = item.productDetails.details.find((d: any) => d.label === selectedOpt.label);
            if (!detail) return;

            if (detail.type === 'dropdown' && detail.values) {
                const option = detail.values.find((v: any) => v.value === selectedOpt.value);
                if (option && option.cost) {
                    optionsCost += option.cost;
                }
            } else if (detail.type === 'number') {
                const numericValue = parseFloat(selectedOpt.value);
                if (!isNaN(numericValue) && numericValue > 0) {
                    numberInputMultiplier *= numericValue;
                }
            }
        });
    }

    const finalUnitCost = (unitCost * numberInputMultiplier) + optionsCost;
    return finalUnitCost;
  }, []);

  const calculateSummary = useCallback(() => {
    const subtotal = watchLineItems.reduce((acc, item) => {
      const unitPrice = calculateLineItemPrice(item);
      form.setValue(`lineItems.${watchLineItems.indexOf(item)}.unitPrice`, unitPrice, { shouldValidate: true });
      return acc + (item.qty * unitPrice);
    }, 0);
    
    const discountedTotal = subtotal - watchDiscount;
    const vat = discountedTotal * (watchVatRate / 100);
    const total = discountedTotal + vat + watchDelivery;
    setSummary({ subtotal, vat, total });
  }, [watchLineItems, watchDiscount, watchVatRate, watchDelivery, calculateLineItemPrice, form]);

  useEffect(() => {
    const subscription = form.watch(() => calculateSummary());
    return () => subscription.unsubscribe();
  }, [form, calculateSummary]);


  const handleAddProduct = () => {
    append({ productId: '', productName: '', qty: 100, options: [], unitPrice: 0, productDetails: null });
  };
  
  const handleProductChange = (index: number, productId: string) => {
    const product = products?.find(p => p.id === productId);
    if (product) {
        form.setValue(`lineItems.${index}.productName`, product.name);
        form.setValue(`lineItems.${index}.productDetails`, product);
        
        // Set default options
        const defaultOptions: {label: string, value: string}[] = [];
        if (product.details) {
            product.details.forEach((detail: any) => {
                if (detail.type === 'dropdown' && detail.values && detail.values.length > 0) {
                    defaultOptions.push({label: detail.label, value: detail.values[0].value});
                }
                if ((detail.type === 'number' || detail.type === 'text') && detail.placeholder) {
                    defaultOptions.push({label: detail.label, value: detail.placeholder});
                }
            });
        }
        form.setValue(`lineItems.${index}.options`, defaultOptions);
        
        // Set quantity to first tier
        const firstTierQty = product.pricing?.tiers?.[0]?.minQty || 100;
        form.setValue(`lineItems.${index}.qty`, firstTierQty);
        
        calculateSummary(); // Recalculate
    }
  };
  
  const handleOptionChange = (lineIndex: number, optionLabel: string, value: string) => {
    const currentOptions = form.getValues(`lineItems.${lineIndex}.options`) || [];
    const optionIndex = currentOptions.findIndex(o => o.label === optionLabel);
    
    if(optionIndex > -1) {
        currentOptions[optionIndex].value = value;
    } else {
        currentOptions.push({ label: optionLabel, value });
    }
    form.setValue(`lineItems.${lineIndex}.options`, currentOptions);
    calculateSummary();
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
              <div className="space-y-4">
                {fields.map((item, index) => (
                  <div key={item.id} className="p-4 border rounded-lg">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                       <Controller
                          control={form.control}
                          name={`lineItems.${index}.qty`}
                          render={({ field }) => (
                            <Input type="number" placeholder="Qty" {...field} />
                          )}
                        />
                    </div>
                    
                    {item.productDetails?.details?.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                            {item.productDetails.details.map((detail: any) => {
                                const options = watchLineItems[index]?.options || [];
                                const selectedOpt = options.find(o => o.label === detail.label);
                                
                                return (
                                    <div key={detail.label}>
                                        <Label className="text-xs">{detail.label}</Label>
                                        {detail.type === 'dropdown' ? (
                                            <Select
                                                onValueChange={(value) => handleOptionChange(index, detail.label, value)}
                                                value={selectedOpt?.value}
                                            >
                                                <SelectTrigger><SelectValue/></SelectTrigger>
                                                <SelectContent>
                                                    {detail.values.map((v: any) => <SelectItem key={v.value} value={v.value}>{v.value} {v.cost > 0 && `(+₦${v.cost})`}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <Input
                                                type={detail.type}
                                                placeholder={detail.placeholder}
                                                value={selectedOpt?.value || ''}
                                                onChange={(e) => handleOptionChange(index, detail.label, e.target.value)}
                                            />
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                    
                    <div className="flex justify-between items-center mt-4">
                         <div className="text-sm">
                            Unit Price: ₦{watchLineItems[index].unitPrice.toFixed(2)} | Sum: ₦{(watchLineItems[index].qty * watchLineItems[index].unitPrice).toFixed(2)}
                        </div>
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                  </div>
                ))}
              </div>
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
                <span>₦ {summary.subtotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Discount</span>
                <Controller name="discount" control={form.control} render={({field}) => <Input type="number" className="h-8 max-w-24 text-right" {...field} />} />
              </div>
               <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Delivery</span>
                <Controller name="delivery" control={form.control} render={({field}) => <Input type="number" className="h-8 max-w-24 text-right" {...field} />} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">VAT (%)</span>
                <Controller name="vatRate" control={form.control} render={({field}) => <Input type="number" className="h-8 max-w-24 text-right" {...field} />} />
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
