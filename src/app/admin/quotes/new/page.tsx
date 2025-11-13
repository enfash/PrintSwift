
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { Calendar as CalendarIcon, PlusCircle, Trash2, Copy, LoaderCircle, Download, File as FileIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking, useDoc } from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';


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
  id: z.string().optional(),
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
  artworkUrls: z.array(z.string()).optional(),
  fromRequestId: z.string().optional(),
});

type QuoteFormValues = z.infer<typeof quoteSchema>;

export default function NewQuotePage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestId = searchParams.get('request_id');

  const productsRef = useMemoFirebase(() => firestore ? collection(firestore, 'products') : null, [firestore]);
  const { data: products, isLoading: isLoadingProducts } = useCollection<any>(productsRef);

  const quoteRequestRef = useMemoFirebase(() => (firestore && requestId) ? doc(firestore, 'quote_requests', requestId) : null, [firestore, requestId]);
  const { data: quoteRequest, isLoading: isLoadingQuoteRequest } = useDoc<any>(quoteRequestRef);
  
  const uniqueProducts = useMemo(() => {
    if (!products) return [];
    const seen = new Set();
    return products.filter(p => {
        const duplicate = seen.has(p.id);
        seen.add(p.id);
        return !duplicate;
    });
  }, [products]);
  
  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      status: 'draft',
      lineItems: [],
      discount: 0,
      vatRate: 7.5,
      delivery: 5000,
      artworkUrls: [],
    },
  });

  useEffect(() => {
    if (quoteRequest && uniqueProducts.length > 0) {
        const lineItemProduct = uniqueProducts.find(p => p.id === quoteRequest.productId);
        form.reset({
            email: quoteRequest.email,
            phone: quoteRequest.phone,
            company: quoteRequest.company,
            notesInternal: quoteRequest.details,
            artworkUrls: quoteRequest.artworkUrls || [],
            fromRequestId: quoteRequest.id,
            lineItems: [{
                productId: quoteRequest.productId,
                productName: quoteRequest.productName,
                productDetails: lineItemProduct || null,
                qty: 100, // default qty
                options: [],
                unitPrice: 0,
            }]
        });
    }
  }, [quoteRequest, uniqueProducts, form]);

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: 'lineItems',
  });

  const lineItems = form.watch('lineItems');
  const discount = form.watch('discount');
  const vatRate = form.watch('vatRate');
  const delivery = form.watch('delivery');
  const artworkUrls = form.watch('artworkUrls');

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
    const newSubtotal = lineItems.reduce((acc, item) => {
      const price = item.unitPrice || calculateLineItemPrice(item) || 0;
      return acc + (item.qty * price);
    }, 0);

    const discountedTotal = newSubtotal - discount;
    const vat = discountedTotal * (vatRate / 100);
    const total = discountedTotal + vat + delivery;
    setSummary({ subtotal: newSubtotal, vat, total });
  }, [lineItems, discount, vatRate, delivery, calculateLineItemPrice]);

  useEffect(() => {
    calculateSummary();
  }, [lineItems, discount, vatRate, delivery, calculateSummary]);


  const handleAddProduct = () => {
    append({ productId: '', productName: '', qty: 100, options: [], unitPrice: 0, productDetails: null });
  };

  const handleDuplicateItem = (index: number) => {
    const itemToDuplicate = form.getValues(`lineItems.${index}`);
    append(itemToDuplicate);
  };
  
  const handleProductChange = (index: number, productId: string) => {
    const product = uniqueProducts?.find(p => p.id === productId);
    if (product) {
        const defaultOptions: {label: string, value: string}[] = [];
        if (product.details) {
            product.details.forEach((detail: any) => {
                if (detail.type === 'dropdown' && detail.values && detail.values.length > 0) {
                    defaultOptions.push({label: detail.label, value: detail.values[0].value});
                }
                if ((detail.type === 'number' || detail.type === 'text') && detail.placeholder) {
                    defaultOptions.push({label: detail.label, value: detail.placeholder});
                } else if (detail.type === 'number') {
                  defaultOptions.push({label: detail.label, value: '1'});
                }
            });
        }
        
        const firstTierQty = product.pricing?.tiers?.[0]?.minQty || 100;

        const updatedItem = {
            ...lineItems[index],
            productId: product.id,
            productName: product.name,
            productDetails: product,
            qty: firstTierQty,
            options: defaultOptions,
            unitPrice: 0, // Reset unit price
        };
        const newUnitPrice = calculateLineItemPrice(updatedItem);
        
        update(index, { ...updatedItem, unitPrice: newUnitPrice });
    }
  };
  
  const handleOptionChange = (lineIndex: number, optionLabel: string, value: string) => {
    const currentItem = form.getValues(`lineItems.${lineIndex}`);
    const currentOptions = currentItem.options || [];
    const optionIndex = currentOptions.findIndex(o => o.label === optionLabel);
    
    if(optionIndex > -1) {
        currentOptions[optionIndex].value = value;
    } else {
        currentOptions.push({ label: optionLabel, value });
    }
    
    const updatedItem = { ...currentItem, options: currentOptions };
    const newUnitPrice = calculateLineItemPrice(updatedItem);
    update(lineIndex, { ...updatedItem, unitPrice: newUnitPrice });
  };
  
  const showNotImplementedToast = (feature: string) => {
    toast({
        title: 'Coming Soon!',
        description: `${feature} functionality is not yet implemented.`
    });
  };

  const saveQuote = async (status: 'draft' | 'sent') => {
    if (!firestore) return;

    form.setValue('status', status);
    const quoteData = form.getValues();
    
    const quotesCollection = collection(firestore, 'quotes');
    const newDocRef = doc(quotesCollection);

    const finalData = {
      ...quoteData,
      id: newDocRef.id,
      subtotal: summary.subtotal,
      vat: summary.vat,
      total: summary.total,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    try {
        await addDocumentNonBlocking(quotesCollection, finalData, { id: finalData.id });
        
        toast({ title: `Quote ${status === 'draft' ? 'Saved as Draft' : 'Submitted'}`, description: `The quote has been successfully saved.` });
        router.push('/admin/quotes');
    } catch (error) {
        console.error(`Error saving quote as ${status}:`, error);
        toast({ variant: 'destructive', title: 'Error', description: `Could not save the quote.` });
    }
  }
  
  const onSubmit = () => saveQuote('sent');
  const onSaveDraft = () => saveQuote('draft');

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">New Quote</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" type="button" onClick={onSaveDraft}>Save Draft</Button>
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
                  <div key={item.id} className="p-4 border rounded-lg relative">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <Controller
                          control={form.control}
                          name={`lineItems.${index}.productId`}
                          render={({ field }) => (
                              <Select onValueChange={(value) => {field.onChange(value); handleProductChange(index, value);}} value={field.value}>
                                  <SelectTrigger><SelectValue placeholder="Select product..."/></SelectTrigger>
                                  <SelectContent>
                                      {isLoadingProducts ? <LoaderCircle className="animate-spin" /> :
                                          uniqueProducts?.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)
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
                                const selectedOpt = lineItems[index]?.options?.find(o => o.label === detail.label);
                                
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
                            Unit Price: ₦{(item.unitPrice || 0).toFixed(2)} | Sum: ₦{((lineItems[index]?.qty || 0) * (item.unitPrice || 0)).toFixed(2)}
                        </div>
                        <div>
                          <Button type="button" variant="ghost" size="icon" onClick={() => handleDuplicateItem(index)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Button variant="outline" size="sm" type="button" onClick={handleAddProduct}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Product
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
           <Card>
            <CardHeader><CardTitle>Artwork Files</CardTitle></CardHeader>
            <CardContent>
                {artworkUrls && artworkUrls.length > 0 ? (
                    <ul className="space-y-2">
                        {artworkUrls.map((url, index) => {
                            const fileName = decodeURIComponent(url.split('/').pop()?.split('?')[0] || 'file');
                            return (
                                <li key={index} className="flex items-center justify-between p-2 rounded-md border text-sm">
                                    <Link href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 truncate hover:underline">
                                        <FileIcon className="h-4 w-4 shrink-0" />
                                        <span className="truncate">{fileName}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No artwork files attached.</p>
                )}
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
