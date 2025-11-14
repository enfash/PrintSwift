
'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
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
import { Calendar as CalendarIcon, PlusCircle, Trash2, Copy, LoaderCircle, Download, File as FileIcon, FileDown } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useCollection, useFirestore, useMemoFirebase, useDoc, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc, serverTimestamp, query, where } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Counter } from '@/components/ui/counter';
import { Combobox } from '@/components/ui/combobox';
import jsPDF from 'jspdf';
import 'jspdf-autotable';


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
  artworkUrls: z.array(z.string()).optional(),
  depositPercentage: z.coerce.number().default(0).optional(),
});

type QuoteFormValues = z.infer<typeof quoteSchema>;

const generateQuoteHtml = (quoteData: QuoteFormValues, summary: any, quoteId: string) => {
    const lineItemsHtml = quoteData.lineItems.map(item => {
        const optionsHtml = item.options?.map(o => `<div><small style="color: #666;">${o.label}: ${o.value}</small></div>`).join('') || '';
        return `
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">
                    <b>${item.productName}</b>
                    ${optionsHtml}
                </td>
                <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.qty}</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">₦${item.unitPrice.toFixed(2)}</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">₦${(item.qty * item.unitPrice).toFixed(2)}</td>
            </tr>
        `;
    }).join('');

    const totalsHtml = `
        <p><b>Subtotal:</b> ₦${summary.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        ${summary.discount > 0 ? `<p><b>Discount:</b> - ₦${summary.discount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>` : ''}
        ${summary.delivery > 0 ? `<p><b>Delivery:</b> ₦${summary.delivery.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>` : ''}
        <p><b>VAT (${quoteData.vatRate}%):</b> ₦${summary.vat.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        <hr/>
        <h3><b>TOTAL: ₦${summary.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b></h3>
        ${summary.depositAmount > 0 ? `
            <p style="margin-top: 10px;"><b>Deposit Due:</b> ₦${summary.depositAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p><b>Balance Remaining:</b> ₦${summary.remainingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        ` : ''}
    `;

    return `
        <div style="font-family: Arial, sans-serif; font-size: 14px; color: #333;">
            <h2>Quote from BOMedia (Ref: ${quoteId})</h2>
            <p>Hi ${quoteData.company || 'there'},</p>
            <p>Thank you for your quote request. Please see the details below:</p>
            <hr/>
            <p><b>To:</b> ${quoteData.company || quoteData.email}<br/><b>Email:</b> ${quoteData.email}</p>
            <hr/>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr>
                        <th style="padding: 8px; border-bottom: 2px solid #333; text-align: left;">Description</th>
                        <th style="padding: 8px; border-bottom: 2px solid #333; text-align: center;">Qty</th>
                        <th style="padding: 8px; border-bottom: 2px solid #333; text-align: right;">Unit Price</th>
                        <th style="padding: 8px; border-bottom: 2px solid #333; text-align: right;">Total</th>
                    </tr>
                </thead>
                <tbody>${lineItemsHtml}</tbody>
            </table>
            <div style="text-align: right; margin-top: 20px;">
                ${totalsHtml}
            </div>
            ${quoteData.notesCustomer ? `<div style="margin-top: 20px;"><p><b>Notes:</b></p><p>${quoteData.notesCustomer}</p></div>` : ''}
            <p>Let us know if you have any questions.</p>
            <p>Best regards,<br/>The BOMedia Team</p>
        </div>
    `;
};


export default function EditQuotePage({ params: paramsProp }: { params: { id: string } }) {
  const params = use(paramsProp);
  const { toast } = useToast();
  const firestore = useFirestore();
  const router = useRouter();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const productsRef = useMemoFirebase(() => firestore ? query(collection(firestore, 'products'), where('status', '==', 'Published')) : null, [firestore]);
  const { data: products, isLoading: isLoadingProducts } = useCollection<any>(productsRef);

  const customersRef = useMemoFirebase(() => firestore ? collection(firestore, 'customers') : null, [firestore]);
  const { data: customers, isLoading: isLoadingCustomers } = useCollection<any>(customersRef);

  const quoteRef = useMemoFirebase(() => firestore ? doc(firestore, 'quotes', params.id) : null, [firestore, params.id]);
  const { data: quote, isLoading: isLoadingQuote } = useDoc<any>(quoteRef);
  
  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
        lineItems: [],
        discount: 0,
        delivery: 0,
        vatRate: 7.5,
        status: 'draft',
        artworkUrls: [],
        depositPercentage: 0,
    }
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: 'lineItems',
  });

  useEffect(() => {
    if (quote) {
      form.reset({
        ...quote,
        dueDate: quote.dueDate ? quote.dueDate.toDate() : undefined,
        discount: quote.discount || 0,
        delivery: quote.delivery || 0,
        vatRate: quote.vatRate || 7.5,
        artworkUrls: quote.artworkUrls || [],
        depositPercentage: quote.depositPercentage || 0,
      });
    }
  }, [quote, form]);

  const lineItems = form.watch('lineItems');
  const discount = form.watch('discount');
  const vatRate = form.watch('vatRate');
  const delivery = form.watch('delivery');
  const artworkUrls = form.watch('artworkUrls');
  const depositPercentage = form.watch('depositPercentage');

  const [summary, setSummary] = useState({ subtotal: 0, vat: 0, total: 0, delivery: 0, depositAmount: 0, remainingBalance: 0 });

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
    if (!lineItems) return;
    const newSubtotal = lineItems.reduce((acc, item) => {
      const price = item.unitPrice || calculateLineItemPrice(item) || 0;
      return acc + (item.qty * price);
    }, 0);

    const newDelivery = delivery || 0;
    const discountedTotal = newSubtotal - discount;
    const vat = discountedTotal * (vatRate / 100);
    const total = discountedTotal + vat + newDelivery;
    
    const depositAmount = total * ((depositPercentage || 0) / 100);
    const remainingBalance = total - depositAmount;
    
    setSummary({ subtotal: newSubtotal, vat, total, delivery: newDelivery, depositAmount, remainingBalance });
  }, [lineItems, discount, vatRate, delivery, depositPercentage, calculateLineItemPrice]);


  useEffect(() => {
    calculateSummary();
  }, [lineItems, discount, vatRate, delivery, depositPercentage, calculateSummary]);


  const handleAddProduct = () => {
    append({ productId: '', productName: '', qty: 100, options: [], unitPrice: 0, productDetails: null });
  };

  const handleDuplicateItem = (index: number) => {
    const itemToDuplicate = form.getValues(`lineItems.${index}`);
    append(itemToDuplicate);
  };
  
  const handleProductChange = (index: number, productId: string) => {
    const product = products?.find(p => p.id === productId);
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

  const handleCustomerSelect = (customerId: string) => {
    const customer = customers?.find(c => c.id === customerId);
    if (customer) {
        form.setValue('customerId', customer.id);
        form.setValue('company', customer.company || '');
        form.setValue('email', customer.email);
        form.setValue('phone', customer.phone || '');
    }
  }
  
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
  
  const handleSendEmail = () => {
    const quoteData = form.getValues();
    const quoteId = params.id.substring(0, 8).toUpperCase();

    if (!quoteData.email) {
      toast({
        variant: 'destructive',
        title: 'Missing Email',
        description: 'Please enter a customer email address before sending.',
      });
      return;
    }

    const subject = `Your Quote from BOMedia (Ref: ${quoteId})`;
    const htmlBody = generateQuoteHtml(quoteData, summary, quoteId);
    
    window.location.href = `mailto:${quoteData.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(htmlBody)}`;
    
    toast({
      title: 'Email Client Opening',
      description: 'Your default email client is opening with a pre-filled HTML quote.',
    });
  };

  const saveQuote = async (status: 'draft' | 'sent') => {
    if (!firestore) return;

    form.setValue('status', status);
    const quoteData = form.getValues();
    const finalData = {
      ...quoteData,
      subtotal: summary.subtotal,
      vat: summary.vat,
      total: summary.total,
      depositAmount: summary.depositAmount,
      remainingBalance: summary.remainingBalance,
      updatedAt: serverTimestamp(),
    }

    try {
        const quoteDocRef = doc(firestore, 'quotes', params.id);
        await updateDocumentNonBlocking(quoteDocRef, finalData);
        
        toast({ title: `Quote Updated`, description: `The quote has been successfully updated.` });
        router.push('/admin/quotes');
    } catch (error) {
        console.error(`Error saving quote as ${status}:`, error);
        toast({ variant: 'destructive', title: 'Error', description: `Could not save the quote.` });
    }
  }

  const handleConvertToOrder = async () => {
    if (!firestore) return;
    const quoteDocRef = doc(firestore, 'quotes', params.id);
    try {
        await updateDocumentNonBlocking(quoteDocRef, { status: 'won', updatedAt: serverTimestamp() });
        toast({ title: 'Quote Converted!', description: 'The quote status has been updated to "won". Redirecting to orders.' });
        router.push('/admin/orders');
    } catch (error) {
        console.error('Error converting quote to order:', error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not convert the quote to an order.' });
    }
  };
  
  const handleGeneratePdf = async () => {
    setIsGeneratingPdf(true);
    try {
        const doc = new jsPDF();
        const quoteData = form.getValues();
        const quoteId = params.id.substring(0, 8).toUpperCase();
        
        // --- Header ---
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text("BOMedia - Quote", 14, 22);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text("Lagos, Nigeria", 14, 30);
        doc.text("info@bomedia.com", 14, 34);
        doc.text("+234 802 224 7567", 14, 38);

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(`QUOTE #${quoteId}`, 200, 22, { align: 'right' });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`Date: ${format(new Date(), 'PP')}`, 200, 30, { align: 'right' });
        if (quoteData.dueDate) {
          doc.text(`Valid Until: ${format(quoteData.dueDate, 'PP')}`, 200, 34, { align: 'right' });
        }
        
        // --- Customer Info ---
        doc.setLineWidth(0.5);
        doc.line(14, 45, 200, 45);
        doc.setFontSize(10);
        doc.text("BILLED TO:", 14, 52);
        doc.text(quoteData.company || quoteData.email, 14, 58);
        if(quoteData.company) doc.text(quoteData.email, 14, 62);
        if(quoteData.phone) doc.text(quoteData.phone, 14, 66);
        
        // --- Line Items Table ---
        const tableBody = quoteData.lineItems.map(item => {
            const optionsString = item.options?.map(o => `${o.label}: ${o.value}`).join('\n') || '';
            return [
                { content: `${item.productName}\n${optionsString}`, styles: { fontSize: 9 } },
                item.qty,
                { content: `₦${item.unitPrice.toFixed(2)}`, styles: { halign: 'right' } },
                { content: `₦${(item.qty * item.unitPrice).toFixed(2)}`, styles: { halign: 'right' } },
            ];
        });

        (doc as any).autoTable({
            startY: 75,
            head: [['Description', 'Qty', 'Unit Price', 'Total']],
            body: tableBody,
            theme: 'striped',
            headStyles: { fillColor: [33, 37, 41] },
        });
        
        // --- Totals ---
        let finalY = (doc as any).lastAutoTable.finalY + 10;
        doc.setFontSize(10);
        
        const addTotalLine = (label: string, value: string) => {
            doc.text(label, 140, finalY, { align: 'left' });
            doc.text(value, 200, finalY, { align: 'right' });
            finalY += 7;
        };

        addTotalLine("Subtotal:", `₦${summary.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
        if (summary.discount > 0) {
            addTotalLine("Discount:", `- ₦${summary.discount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
        }
        if (summary.delivery > 0) {
            addTotalLine("Delivery:", `₦${summary.delivery.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
        }
        addTotalLine(`VAT (${vatRate}%):`, `₦${summary.vat.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
        
        doc.setLineWidth(0.5);
        doc.line(140, finalY - 3, 200, finalY - 3);
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        addTotalLine("TOTAL:", `₦${summary.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
        
        doc.setFont('helvetica', 'normal');
        
        if(summary.depositAmount > 0) {
            finalY += 4;
            addTotalLine("Deposit Due:", `₦${summary.depositAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
            doc.setFont('helvetica', 'bold');
            addTotalLine("Balance Remaining:", `₦${summary.remainingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
        }

        // --- Footer Notes ---
        if (quoteData.notesCustomer) {
            finalY = Math.max(finalY, 250);
            doc.setFontSize(9);
            doc.text("Notes:", 14, finalY);
            doc.text(doc.splitTextToSize(quoteData.notesCustomer, 180), 14, finalY + 4);
        }
        
        doc.save(`Quote-BOMedia-${quoteId}.pdf`);

        toast({ title: 'PDF Generated', description: 'Your PDF has been downloaded.' });
    } catch (error) {
        console.error("PDF Generation Error:", error);
        toast({ variant: 'destructive', title: 'PDF Error', description: 'Failed to generate PDF.' });
    } finally {
        setIsGeneratingPdf(false);
    }
  };

  const onSubmit = () => saveQuote('sent');
  const onSaveDraft = () => saveQuote('draft');

  if (isLoadingQuote) {
    return <div className="flex h-96 items-center justify-center"><LoaderCircle className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Edit Quote</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" type="button" onClick={onSaveDraft}>Save Draft</Button>
          <Button type="submit">Submit Changes</Button>
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
                <Controller
                    control={form.control}
                    name="customerId"
                    render={({ field }) => (
                        <Combobox
                            items={customers?.map(c => ({ value: c.id, label: c.name })) || []}
                            value={field.value}
                            onValueChange={(value) => {
                                field.onChange(value);
                                handleCustomerSelect(value);
                            }}
                            placeholder="Select a customer..."
                            searchPlaceholder="Search customers..."
                            notFoundText="No customers found."
                        />
                    )}
                />
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
                            <div className="flex items-center gap-2">
                                <Label htmlFor={`lineItems.${index}.qty`} className="shrink-0">Qty:</Label>
                                <Counter
                                    value={field.value}
                                    setValue={field.onChange}
                                    min={1}
                                />
                            </div>
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
          <Card className="sticky top-24" id="quote-summary-card">
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
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Deposit (%)</span>
                <Controller name="depositPercentage" control={form.control} render={({field}) => <Input type="number" className="h-8 max-w-24 text-right" {...field} />} />
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Deposit Amount</span>
                <span>₦ {summary.depositAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
               <div className="flex justify-between text-lg font-bold text-primary">
                <span>REMAINING</span>
                <span>₦ {summary.remainingBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
              <Separator />
              <Button type="button" variant="outline" className="w-full" onClick={calculateSummary}>Recalculate</Button>
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
                <Button type="button" variant="secondary" onClick={handleSendEmail}>Send Quote Email</Button>
                <Button type="button" variant="secondary" onClick={handleGeneratePdf} disabled={isGeneratingPdf}>
                    {isGeneratingPdf ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
                    Generate PDF
                </Button>
                <Button type="button" onClick={handleConvertToOrder}>Convert to Order</Button>
                <Button type="button" variant="ghost" className="text-muted-foreground" onClick={() => toast({ title: 'Coming Soon!', description: 'Archive functionality is not yet implemented.' })}>Archive</Button>
            </CardContent>
        </Card>
    </form>
  );
}
