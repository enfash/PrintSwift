
'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useCollection, useDoc, useFirestore, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { LoaderCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const addonSchema = z.object({
  option: z.string(),
  value: z.string(),
  type: z.string(),
  cost: z.coerce.number(),
  active: z.boolean(),
});

const tierSchema = z.object({
  qty: z.coerce.number(),
  setup: z.coerce.number(),
  unitCost: z.coerce.number(),
  margin: z.coerce.number(),
});

const pricingSchema = z.object({
    baseCost: z.coerce.number().optional(),
    tax: z.coerce.number().optional(),
    addons: z.array(addonSchema).optional(),
    tiers: z.array(tierSchema).optional(),
});

const formSchema = z.object({
    productId: z.string(),
    pricing: pricingSchema,
});


export default function PricingEnginePage() {
    const firestore = useFirestore();
    const { toast } = useToast();

    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

    const productsRef = useMemoFirebase(() => firestore ? collection(firestore, 'products') : null, [firestore]);
    const { data: products, isLoading: isLoadingProducts } = useCollection<any>(productsRef);

    const selectedProductRef = useMemoFirebase(() => {
        return firestore && selectedProductId ? doc(firestore, 'products', selectedProductId) : null;
    }, [firestore, selectedProductId]);
    const { data: selectedProduct, isLoading: isLoadingSelectedProduct } = useDoc<any>(selectedProductRef);

    const form = useForm<z.infer<typeof formSchema>>({
        defaultValues: {
            productId: '',
            pricing: {
                baseCost: 0,
                tax: 7.5,
                addons: [],
                tiers: [],
            }
        },
    });

    const { fields: addonFields, append: appendAddon, remove: removeAddon } = useFieldArray({
        control: form.control,
        name: "pricing.addons",
    });

    const { fields: tierFields, append: appendTier, remove: removeTier } = useFieldArray({
        control: form.control,
        name: "pricing.tiers",
    });

    useEffect(() => {
        const defaultPricing = { baseCost: 0, tax: 7.5, addons: [], tiers: [] };
        if (selectedProduct) {
            form.reset({
                productId: selectedProduct.id,
                pricing: {
                    baseCost: selectedProduct.pricing?.baseCost || 0,
                    tax: selectedProduct.pricing?.tax || 7.5,
                    addons: selectedProduct.pricing?.addons || [],
                    tiers: selectedProduct.pricing?.tiers || [],
                }
            });
        } else if (!isLoadingSelectedProduct) {
            form.reset({
                productId: selectedProductId || '',
                pricing: defaultPricing
            });
        }
    }, [selectedProduct, selectedProductId, isLoadingSelectedProduct, form]);

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        if (!firestore || !data.productId) {
            toast({ variant: 'destructive', title: "Error", description: "Please select a product."});
            return;
        };

        const productDocRef = doc(firestore, 'products', data.productId);
        try {
            await updateDocumentNonBlocking(productDocRef, { pricing: data.pricing });
            toast({ title: "Pricing Updated", description: "Pricing rules have been saved."});
        } catch(e) {
            console.error(e);
            toast({ variant: 'destructive', title: "Error", description: "Failed to save pricing."});
        }
    };
    
    const calculateCustomerPrice = (tier: any) => {
        const { qty, setup, unitCost, margin } = tier;
        if (!qty || !unitCost) return 0;
        const totalCost = (setup || 0) + (qty * unitCost);
        const finalPrice = totalCost / (1 - (margin || 0) / 100);
        return Math.round(finalPrice);
    };

    const isSubmitting = form.formState.isSubmitting;
    const currentTiers = form.watch('pricing.tiers');

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Pricing Engine</h1>
                <div className="flex items-center gap-2">
                    <Button variant="outline" type="button" onClick={() => form.reset()}>Revert</Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                        Publish Prices
                    </Button>
                </div>
            </div>
            
            <Card>
                <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Label>Product:</Label>
                            <Select
                                value={selectedProductId || ''}
                                onValueChange={setSelectedProductId}
                            >
                                <SelectTrigger className="w-48"><SelectValue placeholder={isLoadingProducts ? 'Loading...' : 'Select Product'} /></SelectTrigger>
                                <SelectContent>
                                    {products?.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="flex items-center gap-2">
                            <Label>Currency:</Label>
                            <Select defaultValue="ngn">
                                <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                                <SelectContent><SelectItem value="ngn">NGN</SelectItem></SelectContent>
                            </Select>
                        </div>
                    </div>
                     <div className="flex items-center gap-2">
                        <Label>Tax (%):</Label>
                        <Input {...form.register('pricing.tax')} className="w-20" type="number" step="0.1" />
                    </div>
                </CardContent>
            </Card>

            {selectedProductId && (isLoadingSelectedProduct ? <LoaderCircle className="mx-auto h-8 w-8 animate-spin" /> :
            <>
            <Card>
                <CardHeader><CardTitle>Base</CardTitle></CardHeader>
                <CardContent className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Label>Paper Stock:</Label>
                        {/* This could be another dynamic field in the future */}
                        <Select defaultValue="300gsm">
                            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="300gsm">300gsm Art Card</SelectItem></SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center gap-2">
                        <Label>Base Cost (₦):</Label>
                        <Input {...form.register('pricing.baseCost')} className="w-32" type="number" step="0.01"/>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-6">
                <Card>
                    <CardHeader><CardTitle>Add-ons Matrix</CardTitle></CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Option</TableHead>
                                    <TableHead>Value</TableHead>
                                    <TableHead>Cost Type</TableHead>
                                    <TableHead>Cost (₦)</TableHead>
                                    <TableHead>Active</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {addonFields.map((field, index) => (
                                    <TableRow key={field.id}>
                                        <TableCell><Input {...form.register(`pricing.addons.${index}.option`)} /></TableCell>
                                        <TableCell><Input {...form.register(`pricing.addons.${index}.value`)} /></TableCell>
                                        <TableCell>
                                             <Controller
                                                control={form.control}
                                                name={`pricing.addons.${index}.type`}
                                                render={({ field }) => (
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="per_unit">Per Unit</SelectItem>
                                                        <SelectItem value="per_order">Per Order</SelectItem>
                                                        <SelectItem value="multiplier">Multiplier</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                )}
                                            />
                                        </TableCell>
                                        <TableCell><Input type="number" step="0.01" {...form.register(`pricing.addons.${index}.cost`)} /></TableCell>
                                        <TableCell><Controller
                                            control={form.control}
                                            name={`pricing.addons.${index}.active`}
                                            render={({ field }) => (
                                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                            )}
                                        /></TableCell>
                                        <TableCell><Button type="button" variant="destructive" size="sm" onClick={() => removeAddon(index)}>Remove</Button></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                         <div className="mt-4 flex gap-2">
                            <Button type="button" variant="outline" onClick={() => appendAddon({ option: '', value: '', type: 'per_unit', cost: 0, active: true })}>Add Add-on</Button>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Quantity Price Tiers</CardTitle></CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Min Qty</TableHead>
                                    <TableHead>Setup (₦)</TableHead>
                                    <TableHead>Unit Cost (₦)</TableHead>
                                    <TableHead>Margin %</TableHead>
                                    <TableHead>Customer Price (₦)</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tierFields.map((field, index) => (
                                    <TableRow key={field.id}>
                                        <TableCell><Input type="number" {...form.register(`pricing.tiers.${index}.qty`)} className="w-24"/></TableCell>
                                        <TableCell><Input type="number" {...form.register(`pricing.tiers.${index}.setup`)} className="w-24"/></TableCell>
                                        <TableCell><Input type="number" step="0.01" {...form.register(`pricing.tiers.${index}.unitCost`)} className="w-24"/></TableCell>
                                        <TableCell><Input type="number" {...form.register(`pricing.tiers.${index}.margin`)} className="w-24"/></TableCell>
                                        <TableCell>{calculateCustomerPrice(currentTiers?.[index]).toLocaleString()}</TableCell>
                                        <TableCell><Button type="button" variant="destructive" size="sm" onClick={() => removeTier(index)}>Remove</Button></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <div className="mt-4 flex gap-2">
                            <Button type="button" variant="outline" onClick={() => appendTier({ qty: 0, setup: 0, unitCost: 0, margin: 0 })}>Add Tier</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
            </>
            )}
        </form>
    );
}
