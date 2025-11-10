
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoaderCircle, UploadCloud, Image as ImageIcon, Link2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useCollection, useFirestore, useMemoFirebase, updateDocumentNonBlocking, useDoc } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useEffect, useState, use } from 'react';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const productSchema = z.object({
  name: z.string().min(3, 'Product name must be at least 3 characters.'),
  categoryId: z.string({ required_error: 'Please select a category.' }),
  description: z.string().optional(),
  status: z.enum(['Published', 'Draft']).default('Draft'),
  featured: z.boolean().default(false),
  imageUrl: z.string().url({ message: 'Please enter a valid URL.' }).optional(),
});


export default function ProductFormPage({ params }: { params: { slug: string } }) {
    const resolvedParams = use(params);
    const { slug } = resolvedParams;
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const productRef = useMemoFirebase(() => firestore ? doc(firestore, 'products', slug) : null, [firestore, slug]);
    const { data: product, isLoading: isLoadingProduct } = useDoc<z.infer<typeof productSchema> & { id: string }>(productRef);

    const categoriesRef = useMemoFirebase(() => firestore ? collection(firestore, 'product_categories') : null, [firestore]);
    const { data: categories, isLoading: isLoadingCategories } = useCollection<any>(categoriesRef);

    const form = useForm<z.infer<typeof productSchema>>({
        resolver: zodResolver(productSchema),
    });
    
    const imageUrl = form.watch('imageUrl');

    useEffect(() => {
        if (product) {
            form.reset({
                ...product,
                description: product.description || '',
                imageUrl: product.imageUrl || '',
            });
        }
    }, [product, form]);
    
    const onSubmit = async (values: z.infer<typeof productSchema>) => {
        if (!firestore || !product) return;
        setIsSubmitting(true);
        
        const productData = { ...values };

        try {
            const productDocRef = doc(firestore, 'products', product.id);
            updateDocumentNonBlocking(productDocRef, productData);
            toast({ title: 'Product Updated', description: `${values.name} has been successfully updated.` });
            router.push('/admin/products');
        } catch (error) {
            console.error("Error updating product:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not update the product.' });
            setIsSubmitting(false);
        }
    };
    
    // This is a placeholder for a real file upload implementation
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // In a real app, you'd upload this file to Firebase Storage
            // and get a URL back. For now, we'll use a placeholder URL.
            const tempPreviewUrl = URL.createObjectURL(file);
            form.setValue('imageUrl', tempPreviewUrl, { shouldValidate: true });
            toast({ title: "Image Uploaded", description: "This is a preview. Save the product to make it permanent. Note: Real upload is not implemented."})
        }
    };


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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
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
                                            <FormLabel>Product Title</FormLabel>
                                            <FormControl><Input placeholder="e.g., Custom Mugs" {...field} /></FormControl>
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
                    </div>

                    <div className="space-y-8">
                         <Card>
                            <CardHeader>
                                <CardTitle>Media</CardTitle>
                                <CardDescription>Manage product image.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="aspect-video relative rounded-md border bg-muted overflow-hidden">
                                     {imageUrl ? (
                                        <Image
                                            src={imageUrl}
                                            alt={product.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                                            <ImageIcon className="w-12 h-12" />
                                            <p className="text-sm mt-2">No image set</p>
                                        </div>
                                    )}
                                </div>
                                
                                <Tabs defaultValue="url">
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="url"><Link2 className="mr-2 h-4 w-4"/>Link</TabsTrigger>
                                        <TabsTrigger value="upload"><UploadCloud className="mr-2 h-4 w-4"/>Upload</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="url" className="pt-2">
                                         <FormField
                                            control={form.control}
                                            name="imageUrl"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="sr-only">Image URL</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="https://..." {...field} value={field.value || ''} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </TabsContent>
                                    <TabsContent value="upload" className="pt-2">
                                        <Input type="file" onChange={handleFileUpload} accept="image/*" />
                                        <FormDescription className="text-xs mt-2">
                                            For demonstration purposes. A real implementation would upload to cloud storage.
                                        </FormDescription>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </div>

                </div>
            </form>
        </Form>
    );
}

    