
'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoaderCircle, UploadCloud, Image as ImageIcon, Link2, X, PlusCircle, Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useCollection, useFirestore, useMemoFirebase, updateDocumentNonBlocking, useDoc } from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

const productDetailOptionSchema = z.object({
  label: z.string(),
  values: z.array(z.object({ value: z.string() })),
});

const productSchema = z.object({
  slug: z.string().min(3, 'Slug must be at least 3 characters.').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens.'),
  name: z.string().min(3, 'Product name must be at least 3 characters.'),
  categoryId: z.string({ required_error: 'Please select a category.' }),
  description: z.string().optional(),
  status: z.enum(['Published', 'Draft']).default('Draft'),
  featured: z.boolean().default(false),
  imageUrls: z.array(z.string().url()).min(1, "Product must have at least one image.").max(6, "You can add a maximum of 6 images."),
  mainImageIndex: z.number().min(0).default(0),
  details: z.array(productDetailOptionSchema).optional(),
});

export default function ProductEditPage({ params }: { params: { slug: string } }) {
    const { slug: productId } = params; 
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();
    
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
        }
    });

    const { fields: imageFields, append: appendImage, remove: removeImage } = useFieldArray({
        control: form.control,
        name: "imageUrls"
    });
    
    const { fields: detailFields, append: appendDetail, remove: removeDetail } = useFieldArray({
        control: form.control,
        name: "details"
    });

    useEffect(() => {
        if (product) {
            form.reset({
                name: product.name || '',
                slug: product.slug || '',
                categoryId: product.categoryId || '',
                description: product.description || '',
                status: product.status || 'Draft',
                featured: product.featured || false,
                imageUrls: product.imageUrls || [],
                mainImageIndex: product.mainImageIndex || 0,
                details: product.details || [],
            });
        }
    }, [product, form]);
    
    const onSubmit = async (values: z.infer<typeof productSchema>) => {
        if (!firestore || !product) return;
        
        try {
            const productDocRef = doc(firestore, 'products', product.id);

            const persistentImageUrls = values.imageUrls.filter(url => !url.startsWith('blob:'));
            if (persistentImageUrls.length !== values.imageUrls.length) {
                toast({ variant: 'destructive', title: 'Temporary Images Detected', description: "Please replace local image previews with permanent links before saving. The save operation was cancelled."});
                return;
            }
            
            const updateData = {
                ...values,
                imageUrls: persistentImageUrls,
                updatedAt: serverTimestamp()
            };
            
            await updateDocumentNonBlocking(productDocRef, updateData);
            toast({ title: 'Product Updated', description: `${values.name} has been successfully updated.` });
            router.push('/admin/products');
        } catch (error) {
            console.error("Error updating product:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not update the product.' });
        }
    };
    
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            if (imageFields.length + files.length > 6) {
                toast({ variant: 'destructive', title: "Too many images", description: "You can upload a maximum of 6 images."});
                return;
            }
            Array.from(files).forEach(file => {
                const tempPreviewUrl = URL.createObjectURL(file);
                appendImage(tempPreviewUrl);
            })
            toast({ title: "Image Added", description: "This is a local preview. To save, replace it with a permanent URL using the Link tab."})
        }
    };

    const handleAddImageUrl = (url: string) => {
        if (imageFields.length >= 6) {
            toast({ variant: 'destructive', title: "Too many images", description: "You can add a maximum of 6 images."});
            return;
        }
        try {
            z.string().url().parse(url);
            appendImage(url);
            const input = document.getElementById('imageUrlInput') as HTMLInputElement;
            if (input) input.value = '';
        } catch {
            toast({ variant: 'destructive', title: "Invalid URL", description: "Please enter a valid image URL."});
        }
    }

    const setMainImage = (index: number) => {
        form.setValue('mainImageIndex', index);
    };

    const mainImageIndex = form.watch('mainImageIndex');
    const isSubmitting = form.formState.isSubmitting;

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
                                <CardDescription>Manage product images (min 1, max 6).</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                                     {imageFields.map((field, index) => (
                                        <div key={field.id} className="relative aspect-square group cursor-pointer" onClick={() => setMainImage(index)}>
                                            {field.value ? (
                                                <Image
                                                    src={field.value}
                                                    alt={`Product image ${index + 1}`}
                                                    fill
                                                    className="object-cover rounded-md"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-muted rounded-md flex items-center justify-center">
                                                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                                                </div>
                                            )}
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
                                     ))}
                                     {imageFields.length === 0 && (
                                         <div className="col-span-full aspect-video relative rounded-md border bg-muted flex flex-col items-center justify-center text-muted-foreground">
                                            <ImageIcon className="w-12 h-12" />
                                            <p className="text-sm mt-2">No images added</p>
                                        </div>
                                     )}
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

                                <Tabs defaultValue="upload">
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="upload"><UploadCloud className="mr-2 h-4 w-4"/>Upload</TabsTrigger>
                                        <TabsTrigger value="url"><Link2 className="mr-2 h-4 w-4"/>Link</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="upload" className="pt-2">
                                        <Input type="file" onChange={handleFileUpload} accept="image/*" disabled={imageFields.length >= 6} multiple />
                                        <FormDescription className="text-xs mt-2">
                                            Local previews must be replaced with a permanent URL before saving.
                                        </FormDescription>
                                    </TabsContent>
                                     <TabsContent value="url" className="pt-2">
                                         <div className="flex gap-2">
                                            <Input 
                                                id="imageUrlInput"
                                                placeholder="https://..." 
                                                disabled={imageFields.length >= 6}
                                            />
                                            <Button type="button" onClick={() => handleAddImageUrl((document.getElementById('imageUrlInput') as HTMLInputElement).value)}>Add</Button>
                                         </div>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader>
                                <CardTitle>Customization Options</CardTitle>
                                <CardDescription>Define dropdowns like "Paper Type" or "Finish" for customers.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {detailFields.map((field, index) => (
                                    <div key={field.id} className="p-4 border rounded-md space-y-3">
                                        <div className="flex justify-between items-center">
                                            <Label>Option {index + 1}</Label>
                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeDetail(index)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
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
                                            name={`details.${index}.values`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Values</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="Enter one value per line, e.g.,&#10;16pt. Premium Matte&#10;14pt. Uncoated"
                                                            value={field.value.map(v => v.value).join('\n')}
                                                            onChange={(e) => {
                                                                const valuesArray = e.target.value.split('\n').map(v => ({ value: v }));
                                                                field.onChange(valuesArray);
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormDescription>Each line will be a separate option in the dropdown.</FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                ))}
                                <Button type="button" variant="outline" onClick={() => appendDetail({ label: '', values: [] })}>
                                    <PlusCircle className="mr-2 h-4 w-4" /> Add Option
                                </Button>
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

    