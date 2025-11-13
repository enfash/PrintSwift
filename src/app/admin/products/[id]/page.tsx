

'use client';

import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoaderCircle, X, PlusCircle, Trash2, UploadCloud } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useCollection, useFirestore, useMemoFirebase, updateDocumentNonBlocking, useDoc, useStorage } from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useEffect, useState, use } from 'react';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getSafeImageUrl } from '@/lib/utils';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { cn } from '@/lib/utils';

const detailValueSchema = z.object({
  value: z.string().min(1, "Value is required."),
  cost: z.coerce.number().default(0),
});

const productDetailOptionSchema = z.object({
  label: z.string().min(1, "Label is required."),
  type: z.enum(["dropdown", "text", "number"]),
  placeholder: z.string().optional(),
  values: z.array(detailValueSchema).optional(),
  min: z.coerce.number().optional(),
  max: z.coerce.number().optional(),
});

const addonSchema = z.object({
  option: z.string(),
  value: z.string(),
  type: z.string(),
  cost: z.coerce.number(),
  active: z.boolean(),
});

const tierSchema = z.object({
  minQty: z.coerce.number(),
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

const productSchema = z.object({
  slug: z.string().min(3, 'Slug must be at least 3 characters.').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens.'),
  name: z.string().min(3, 'Product name must be at least 3 characters.'),
  categoryId: z.string({ required_error: 'Please select a category.' }),
  description: z.string().optional(),
  status: z.enum(['Published', 'Draft']).default('Draft'),
  featured: z.boolean().default(false),
  imageUrls: z.array(z.string()).min(1, "Product must have at least one image.").max(6, "You can add a maximum of 6 images."),
  mainImageIndex: z.number().min(0).default(0),
  details: z.array(productDetailOptionSchema).optional(),
  pricing: pricingSchema.optional(),
});

export default function ProductEditPage({ params }: { params: { id: string } }) {
    const productId = use(params).id;
    const firestore = useFirestore();
    const storage = useStorage();
    const router = useRouter();
    const { toast } = useToast();
    const [isUploading, setIsUploading] = useState(false);
    
    const productRef = useMemoFirebase(() => firestore ? doc(firestore, 'products', productId) : null, [firestore, productId]);
    const { data: product, isLoading: isLoadingProduct } = useDoc<z.infer<typeof productSchema> & { id: string }>(productRef);

    const categoriesRef = useMemoFirebase(() => firestore ? collection(firestore, 'product_categories') : null, [firestore]);
    const { data: categories, isLoading: isLoadingCategories } = useCollection<any>(categoriesRef);

    const form = useForm<z.infer<typeof productSchema>>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            slug: '',
            name: '',
            description: '',
            imageUrls: [],
            mainImageIndex: 0,
            featured: false,
            status: 'Draft',
            details: [],
            pricing: {
                baseCost: 0,
                tax: 7.5,
                addons: [],
                tiers: [],
            }
        }
    });

    const { fields: imageFields, append: appendImage, remove: removeImage } = useFieldArray({
        control: form.control,
        name: "imageUrls"
    });
    
    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!storage || !event.target.files || event.target.files.length === 0) return;
        if (imageFields.length >= 6) {
            toast({ variant: 'destructive', title: "Maximum images reached", description: "You can only add up to 6 images."});
            return;
        }

        const file = event.target.files[0];
        setIsUploading(true);

        try {
            const fileRef = storageRef(storage, `product-images/${productId}/${file.name}-${Date.now()}`);
            await uploadBytes(fileRef, file);
            const downloadURL = await getDownloadURL(fileRef);
            appendImage(downloadURL);
            toast({ title: 'Upload Successful', description: 'Image has been added to the gallery.' });
        } catch (error) {
            console.error("Upload error:", error);
            toast({ variant: 'destructive', title: 'Upload Failed', description: 'Could not upload the image. Please try again.' });
        } finally {
            setIsUploading(false);
            event.target.value = '';
        }
    };

    const { fields: detailFields, append: appendDetail, remove: removeDetail } = useFieldArray({
        control: form.control,
        name: "details"
    });

    const { fields: tierFields, append: appendTier, remove: removeTier } = useFieldArray({
        control: form.control,
        name: "pricing.tiers",
    });

    useEffect(() => {
        if (product) {
            form.reset({
                ...product,
                slug: product.slug || '',
                name: product.name || '',
                description: product.description || '',
                categoryId: product.categoryId || '',
                status: product.status || 'Draft',
                featured: product.featured || false,
                imageUrls: product.imageUrls || [],
                mainImageIndex: product.mainImageIndex || 0,
                details: product.details || [],
                pricing: product.pricing || { baseCost: 0, tax: 7.5, addons: [], tiers: [] }
            });
        }
    }, [product, form]);
    
    const onSubmit = async (values: z.infer<typeof productSchema>) => {
        if (!firestore || !product) return;
        
        try {
            const productDocRef = doc(firestore, 'products', product.id);

            const updateData = { ...values };
            
            const cleanData = (obj: any): any => {
              const newObj: any = {};
              for (const key in obj) {
                if (obj[key] !== undefined && obj[key] !== null) {
                  if (Array.isArray(obj[key])) {
                    newObj[key] = obj[key].map((item: any) =>
                      (item && typeof item === 'object') ? cleanData(item) : item
                    );
                  } else if (obj[key] && typeof obj[key] === 'object' && !obj[key].hasOwnProperty('_nanoseconds')) { // Exclude Timestamps
                    newObj[key] = cleanData(obj[key]);
                  } else if (obj[key] !== undefined) {
                    newObj[key] = obj[key];
                  }
                }
              }
              return newObj;
            };
            
            const sanitizedData = cleanData(updateData);
            sanitizedData.updatedAt = serverTimestamp();
            
            await updateDocumentNonBlocking(productDocRef, sanitizedData);
            toast({ title: 'Product Updated', description: `${values.name} has been successfully updated.` });
            router.push('/admin/products');
        } catch (error: any) {
            console.error("Error updating product:", error);
            toast({ 
                variant: 'destructive', 
                title: 'Error updating product', 
                description: error.message || 'Could not update the product. Please check the console for details.' 
            });
        }
    };

    const setMainImage = (index: number) => {
        form.setValue('mainImageIndex', index);
    };
    
    const calculateCustomerPrice = (tier: any) => {
        if (!tier || typeof tier.minQty !== 'number' || typeof tier.unitCost !== 'number') return 0;
        const { minQty, setup = 0, unitCost, margin = 0 } = tier;
        const totalCost = setup + (minQty * unitCost);
        const finalPrice = totalCost / (1 - margin / 100);
        return isNaN(finalPrice) ? 0 : Math.round(finalPrice);
    };

    const mainImageIndex = form.watch('mainImageIndex');
    const isSubmitting = form.formState.isSubmitting;
    const currentTiers = form.watch('pricing.tiers');

    if (isLoadingProduct) {
        return <div className="flex h-96 items-center justify-center"><LoaderCircle className="h-8 w-8 animate-spin" /></div>;
    }
    
    if (!product) {
        return <div className="flex h-96 items-center justify-center"><p>Product not found.</p></div>;
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" type="button" onClick={() => router.push('/admin/products')}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </div>
                </div>

                <Tabs defaultValue="general">
                    <TabsList>
                        <TabsTrigger value="general">General</TabsTrigger>
                        <TabsTrigger value="details">Details & Media</TabsTrigger>
                        <TabsTrigger value="pricing">Pricing</TabsTrigger>
                        <TabsTrigger value="publishing">Publishing</TabsTrigger>
                    </TabsList>
                    <TabsContent value="general" className="pt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Basic Info</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Product Name</FormLabel>
                                            <FormControl><Input placeholder="e.g., Custom Mugs" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="slug"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Slug</FormLabel>
                                            <FormControl><Input placeholder="e.g., custom-mugs" {...field} value={field.value || ''} /></FormControl>
                                            <FormDescription>The user-friendly URL for the product page.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="categoryId"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder={isLoadingCategories ? "Loading..." : "Select a category"} />
                                            </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {categories?.map(category => (
                                                    <SelectItem key={category.id} value={category.id}>
                                                        {category.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
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
                                            <FormControl><Textarea placeholder="A brief summary of the product." {...field} value={field.value || ''} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="details" className="pt-6 space-y-8">
                         <Card>
                            <CardHeader>
                                <CardTitle>Media</CardTitle>
                                <CardDescription>Add up to 6 images for your product gallery.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                                     {imageFields.map((field, index) => {
                                        const finalImageUrl = getSafeImageUrl(field.value);

                                        return (
                                            <div key={field.id} className="relative aspect-square group cursor-pointer" onClick={() => setMainImage(index)}>
                                                <Image
                                                    src={finalImageUrl}
                                                    alt={`Product image ${index + 1}`}
                                                    fill
                                                    className="object-cover rounded-md"
                                                />
                                                {mainImageIndex === index && (
                                                    <Badge variant="secondary" className="absolute top-1 left-1">Main</Badge>
                                                )}
                                                <Button 
                                                    type="button"
                                                    variant="destructive" 
                                                    size="icon" 
                                                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        );
                                     })}
                                </div>
                                
                                <FormField
                                    control={form.control}
                                    name="imageUrls"
                                    render={() => (
                                        <FormItem>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <label className={cn(
                                    "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted transition",
                                    isUploading && "opacity-50 cursor-not-allowed"
                                )}>
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        {isUploading ? (
                                            <LoaderCircle className="w-8 h-8 mb-3 text-muted-foreground animate-spin"/>
                                        ) : (
                                            <UploadCloud className="w-8 h-8 mb-3 text-muted-foreground"/>
                                        )}
                                        <p className="mb-2 text-sm text-muted-foreground">
                                            <span className="font-semibold">
                                                {isUploading ? 'Uploading...' : 'Click to upload or drag and drop'}
                                            </span>
                                        </p>
                                    </div>
                                    <Input 
                                        id="imageUpload"
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                        disabled={imageFields.length >= 6 || isUploading}
                                    />
                                </label>

                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader>
                                <CardTitle>Customization Options</CardTitle>
                                <CardDescription>Define form fields for customers to customize the product.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {detailFields.map((field, index) => {
                                    const detailType = form.watch(`details.${index}.type`);
                                    return (
                                    <div key={field.id} className="p-4 border rounded-md space-y-4 relative">
                                        <div className="flex justify-between items-start">
                                            <div className="grid grid-cols-2 gap-4 flex-grow pr-10">
                                                <FormField
                                                    control={form.control}
                                                    name={`details.${index}.label`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                        <FormLabel>Label</FormLabel>
                                                        <FormControl><Input placeholder="e.g., Paper Type" {...field} /></FormControl>
                                                        <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name={`details.${index}.type`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Field Type</FormLabel>
                                                            <Select onValueChange={field.onChange} value={field.value}>
                                                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="dropdown">Dropdown</SelectItem>
                                                                    <SelectItem value="text">Text Input</SelectItem>
                                                                    <SelectItem value="number">Number Input (Multiplier)</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removeDetail(index)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>

                                        {detailType === 'dropdown' && (
                                            <Controller
                                                control={form.control}
                                                name={`details.${index}.values`}
                                                render={({ field }) => (
                                                    <div className="space-y-2">
                                                        <Label>Dropdown Options & Pricing</Label>
                                                        <Textarea
                                                            placeholder="Enter one value per line, e.g.,
Value one
Value two"
                                                            defaultValue={field.value?.map(v => v.value).join('\n')}
                                                            onBlur={(e) => {
                                                                const textValues = e.target.value.split('\n').filter(v => v.trim());
                                                                const newValues = textValues.map(tv => {
                                                                    const existing = field.value?.find(fv => fv.value === tv);
                                                                    return existing || { value: tv, cost: 0 };
                                                                });
                                                                field.onChange(newValues);
                                                            }}
                                                        />
                                                        {field.value?.map((v, vIndex) => (
                                                            <div key={vIndex} className="flex items-center gap-2">
                                                                <Input value={v.value} disabled className="flex-1"/>
                                                                <Label>₦</Label>
                                                                <Input 
                                                                    type="number"
                                                                    placeholder="Cost"
                                                                    className="w-24"
                                                                    defaultValue={v.cost}
                                                                    onBlur={(e) => {
                                                                        const newCost = parseFloat(e.target.value) || 0;
                                                                        const updatedValues = [...field.value!];
                                                                        updatedValues[vIndex].cost = newCost;
                                                                        field.onChange(updatedValues);
                                                                    }}
                                                                />
                                                            </div>
                                                        ))}
                                                        <FormDescription>Each line will be an option. Set cost adjustments for each.</FormDescription>
                                                    </div>
                                                )}
                                            />
                                        )}

                                        {detailType === 'text' && (
                                            <FormField
                                                control={form.control}
                                                name={`details.${index}.placeholder`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Placeholder</FormLabel>
                                                        <FormControl><Input placeholder="e.g., Enter your text here" {...field} value={field.value || ''} /></FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        )}
                                        
                                        {detailType === 'number' && (
                                            <div className="grid grid-cols-3 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name={`details.${index}.placeholder`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Placeholder</FormLabel>
                                                            <FormControl><Input type="number" placeholder="e.g., 1" {...field} value={field.value || ''} /></FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name={`details.${index}.min`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Min Value</FormLabel>
                                                            <FormControl><Input type="number" placeholder="e.g., 1" {...field} /></FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name={`details.${index}.max`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Max Value</FormLabel>
                                                            <FormControl><Input type="number" placeholder="e.g., 10" {...field} /></FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        )}
                                    </div>
                                )})}
                                <Button type="button" variant="outline" onClick={() => appendDetail({ label: '', type: 'dropdown', placeholder: '', values: [] })}>
                                    <PlusCircle className="mr-2 h-4 w-4" /> Add Option
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="pricing" className="pt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Pricing Rules</CardTitle>
                                <CardDescription>Set up quantity-based pricing tiers for this product.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Min Qty</TableHead>
                                            <TableHead>Setup Cost (₦)</TableHead>
                                            <TableHead>Unit Cost (₦)</TableHead>
                                            <TableHead>Margin %</TableHead>
                                            <TableHead>Customer Price (₦)</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {tierFields.map((field, index) => (
                                            <TableRow key={field.id}>
                                                <TableCell><Input type="number" {...form.register(`pricing.tiers.${index}.minQty`)} className="w-24"/></TableCell>
                                                <TableCell><Input type="number" {...form.register(`pricing.tiers.${index}.setup`)} className="w-24"/></TableCell>
                                                <TableCell><Input type="number" step="0.01" {...form.register(`pricing.tiers.${index}.unitCost`)} className="w-24"/></TableCell>
                                                <TableCell><Input type="number" {...form.register(`pricing.tiers.${index}.margin`)} className="w-24"/></TableCell>
                                                <TableCell>
                                                    {calculateCustomerPrice(currentTiers?.[index]).toLocaleString()}
                                                </TableCell>
                                                <TableCell><Button type="button" variant="destructive" size="sm" onClick={() => removeTier(index)}>Remove</Button></TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                <div className="mt-4 flex gap-2">
                                    <Button type="button" variant="outline" onClick={() => appendTier({ minQty: 0, setup: 0, unitCost: 0, margin: 40 })}>Add Tier</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="publishing" className="pt-6">
                         <Card>
                            <CardHeader>
                                <CardTitle>Publishing</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                    <FormItem className="flex items-center justify-between">
                                        <div>
                                            <FormLabel>Status</FormLabel>
                                            <p className="text-sm text-muted-foreground">Set product visibility.</p>
                                        </div>
                                        <FormControl>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger className="w-[180px]">
                                                    <SelectValue placeholder="Status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Published">Published</SelectItem>
                                                    <SelectItem value="Draft">Draft</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                    </FormItem>
                                    )}
                                />
                                <Separator />
                                <FormField
                                    control={form.control}
                                    name="featured"
                                    render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                        <FormLabel className="text-base">
                                            Featured Product
                                        </FormLabel>
                                        <FormDescription>
                                            Display this product on the homepage.
                                        </FormDescription>
                                        </div>
                                        <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                        </FormControl>
                                    </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </form>
        </Form>
    );
}
