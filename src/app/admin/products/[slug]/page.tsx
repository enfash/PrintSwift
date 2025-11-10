
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UploadCloud, LoaderCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useCollection, useFirestore, useMemoFirebase, updateDocumentNonBlocking, useDoc } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useEffect, useState, use } from 'react';

const productSchema = z.object({
  name: z.string().min(3, 'Product name must be at least 3 characters.'),
  categoryId: z.string({ required_error: 'Please select a category.' }),
  description: z.string().optional(),
  status: z.enum(['Published', 'Draft']).default('Draft'),
  featured: z.boolean().default(false),
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

    useEffect(() => {
        if (product) {
            form.reset(product);
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

                <div className="grid gap-8">
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
                            <CardTitle>Media</CardTitle>
                            <CardDescription>Upload images for your product.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted transition">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <UploadCloud className="w-8 h-8 mb-3 text-muted-foreground"/>
                                    <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                </div>
                                <Input type="file" className="hidden" multiple />
                            </div>
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
            </form>
        </Form>
    );
}
