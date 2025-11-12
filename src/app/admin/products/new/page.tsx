
'use client';

import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UploadCloud, LoaderCircle, Image as ImageIcon, Link2, X } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useState, useEffect, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';


const productSchema = z.object({
  slug: z.string().min(3, 'Slug must be at least 3 characters.').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens.'),
  name: z.string().min(3, 'Product name must be at least 3 characters.'),
  categoryId: z.string({ required_error: 'Please select a category.' }),
  description: z.string().optional(),
  status: z.enum(['Published', 'Draft']).default('Draft'),
  featured: z.boolean().default(false),
  imageUrls: z.array(z.string()).min(1, "Product must have at least one image.").max(6, "You can add a maximum of 6 images."),
  mainImageIndex: z.number().min(0).default(0),
});

const slugify = (str: string) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

export default function ProductFormPage() {
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const categoriesRef = useMemoFirebase(() => firestore ? collection(firestore, 'product_categories') : null, [firestore]);
    const { data: categories, isLoading: isLoadingCategories } = useCollection<any>(categoriesRef);

    const form = useForm<z.infer<typeof productSchema>>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            slug: '',
            name: '',
            description: '',
            status: 'Draft',
            featured: false,
            imageUrls: [],
            mainImageIndex: 0,
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "imageUrls"
    });
    
    const watchName = form.watch('name');
    const isSlugManuallyEdited = useRef(false);

    useEffect(() => {
        if (!isSlugManuallyEdited.current && watchName) {
            const newSlug = slugify(watchName);
            form.setValue('slug', newSlug);
        }
    }, [watchName, form]);

    const onSubmit = async (values: z.infer<typeof productSchema>) => {
        if (!firestore) return;
        setIsSubmitting(true);
        
        const productsCollectionRef = collection(firestore, 'products');
        const newProductRef = doc(productsCollectionRef);

        const finalProductData = {
            id: newProductRef.id,
            ...values,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            pricing: {
                baseCost: 0,
                tax: 7.5,
                addons: [],
                tiers: [],
            }
        }

        try {
            await addDocumentNonBlocking(productsCollectionRef, finalProductData, { id: finalProductData.id });
            toast({ title: 'Product Created', description: `${values.name} has been successfully created.` });
            router.push('/admin/products');
        } catch (error) {
            console.error("Error saving product:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not save the product.' });
            setIsSubmitting(false);
        }
    };
    
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            if (fields.length + files.length > 6) {
                toast({ variant: 'destructive', title: "Too many images", description: "You can upload a maximum of 6 images."});
                return;
            }
            Array.from(files).forEach(file => {
                const tempPreviewUrl = URL.createObjectURL(file);
                append(tempPreviewUrl);
            })
            toast({ title: "Image Added", description: "This is a local preview. To save, replace it with a permanent URL using the Link tab."})
        }
    };

    const handleAddImageUrl = (url: string) => {
        if (fields.length >= 6) {
            toast({ variant: 'destructive', title: "Too many images", description: "You can add a maximum of 6 images."});
            return;
        }
        try {
            z.string().url().parse(url);
            append(url);
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

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">Add New Product</h1>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" type="button" onClick={() => router.push('/admin/products')}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            Save Product
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
                                            <FormControl><Input placeholder="e.g., custom-mugs" {...field} onChange={(e) => {
                                                isSlugManuallyEdited.current = true;
                                                field.onChange(e);
                                            }} /></FormControl>
                                            <FormDescription>This will be the product's URL. It's auto-generated from the name but can be edited.</FormDescription>
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
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                                            <FormControl><Textarea placeholder="A brief summary of the product." {...field} /></FormControl>
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
                                <CardDescription>Manage product images (min 1, max 6).</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-3 gap-2">
                                     {fields.map((field, index) => (
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
                                                onClick={(e) => { e.stopPropagation(); remove(index); }}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                     ))}
                                     {fields.length === 0 && (
                                         <div className="col-span-3 aspect-video relative rounded-md border bg-muted flex flex-col items-center justify-center text-muted-foreground">
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
                                        <Input type="file" onChange={handleFileUpload} accept="image/*" disabled={fields.length >= 6} multiple />
                                        <FormDescription className="text-xs mt-2">
                                            Local previews must be replaced with a permanent URL before saving.
                                        </FormDescription>
                                    </TabsContent>
                                     <TabsContent value="url" className="pt-2">
                                         <div className="flex gap-2">
                                            <Input 
                                                id="imageUrlInput"
                                                placeholder="https://..." 
                                                disabled={fields.length >= 6}
                                            />
                                            <Button type="button" onClick={() => handleAddImageUrl((document.getElementById('imageUrlInput') as HTMLInputElement).value)}>Add</Button>
                                         </div>
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
