
'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoaderCircle, UploadCloud, PlusCircle, Trash2, File as FileIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState, Suspense, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  useCollection,
  useFirestore,
  addDocumentNonBlocking,
  useMemoFirebase,
  useStorage,
} from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const lineItemSchema = z.object({
  productId: z.string({ required_error: 'Please select a product.' }),
  productName: z.string(),
  quantity: z.coerce.number().min(1, { message: 'Quantity must be at least 1.' }),
});

const quoteFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  phone: z.string().min(10, { message: 'Please enter a valid phone number.'}),
  company: z.string().optional(),
  lineItems: z.array(lineItemSchema).min(1, 'Please add at least one product.'),
  artworkUrls: z.array(z.string()).optional(),
  details: z.string().optional(),
});

type QuoteFormData = z.infer<typeof quoteFormSchema>;

function QuoteForm() {
  const searchParams = useSearchParams();
  const productNameQuery = searchParams.get('product');
  const firestore = useFirestore();
  const storage = useStorage();

  const productsRef = useMemoFirebase(() => firestore ? collection(firestore, 'products') : null, [firestore]);
  const { data: products, isLoading: isLoadingProducts } = useCollection<any>(productsRef);

  const uniqueProducts = useMemo(() => {
    if (!products) return [];
    const seen = new Set();
    return products.filter(p => {
        const duplicate = seen.has(p.id);
        seen.add(p.id);
        return !duplicate;
    });
  }, [products]);

  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Generate a unique ID for the quote request upfront
  const [quoteRequestId] = useState(() => firestore ? doc(collection(firestore, 'quote_requests')).id : '');

  const form = useForm<QuoteFormData>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      company: '',
      lineItems: [{ productId: '', productName: '', quantity: 100 }],
      artworkUrls: [],
      details: '',
    },
  });
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'lineItems',
  });
  
  const { fields: artworkFields, append: appendArtwork, remove: removeArtwork } = useFieldArray({
    control: form.control,
    name: 'artworkUrls'
  });

  useEffect(() => {
    if (productNameQuery && uniqueProducts && uniqueProducts.length > 0 && fields.length === 1 && fields[0].productId === '') {
        const product = uniqueProducts.find(p => p.name === productNameQuery);
        if (product) {
            form.setValue('lineItems.0.productId', product.id);
            form.setValue('lineItems.0.productName', product.name);
        }
    }
  }, [productNameQuery, uniqueProducts, form, fields]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!storage || !event.target.files || event.target.files.length === 0) {
      return;
    }
  
    const files = Array.from(event.target.files);
    setIsUploading(true);
    let successfulUploads = 0;
  
    await Promise.all(files.map(async (file) => {
      const MAX_MB = 25;
      if (file.size > MAX_MB * 1024 * 1024) {
        toast({ variant: 'destructive', title: 'File too large', description: `"${file.name}" exceeds the ${MAX_MB}MB limit.` });
        return;
      }
      
      const safeName = encodeURIComponent(file.name.replace(/\s+/g, '_'));
      const path = `quote-artwork/${quoteRequestId}/${safeName}`;
      const fileRef = storageRef(storage, path);
      const uploadTask = uploadBytesResumable(fileRef, file, { contentType: file.type });
  
      try {
        await uploadTask;
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        appendArtwork(downloadURL);
        successfulUploads++;
      } catch (error) {
        console.error("Upload error:", error);
        toast({ variant: 'destructive', title: `Upload Failed: ${file.name}`, description: (error as Error).message });
      }
    }));
  
    setIsUploading(false);
    if (event.target) event.target.value = ''; // Reset file input
    if (successfulUploads > 0) {
      toast({ title: 'Upload Complete', description: `${successfulUploads} file(s) uploaded successfully.` });
    }
  };
  

  async function onSubmit(values: z.infer<typeof quoteFormSchema>) {
    if (!firestore) {
        toast({
            variant: "destructive",
            title: 'Submission Failed',
            description: "Could not connect to the database. Please try again later.",
        });
        return;
    }

    setIsSubmitting(true);
    const quoteRequestsRef = collection(firestore, 'quote_requests');
    const docToSave = {
        ...values,
        id: quoteRequestId,
        submissionDate: serverTimestamp(),
        status: 'Pending',
    }
    
    try {
        await addDocumentNonBlocking(quoteRequestsRef, docToSave, { id: docToSave.id });

        setIsSubmitting(false);
        form.reset();
        toast({
            title: 'Quote Request Sent!',
            description: "Thank you! We've received your request and will get back to you with a quote within 1-2 business days.",
        });
    } catch (error) {
        console.error("Error submitting quote:", error);
        setIsSubmitting(false);
        toast({
            variant: "destructive",
            title: 'Submission Failed',
            description: "There was an error sending your request. Please try again.",
        });
    }
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-16 md:py-24">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-headline">Request a Quote</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Get a personalized quote for your custom printing project. Fill out the details below, and our team will get back to you promptly.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <h3 className="text-lg font-medium border-b pb-2">Contact Information</h3>
              <div className="grid sm:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input placeholder="john.doe@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
               <div className="grid sm:grid-cols-2 gap-6">
                 <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                            <Input placeholder="+234 800 000 0000" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Your Company Inc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <h3 className="text-lg font-medium border-b pb-2 pt-4">Order Details</h3>
              <div className="space-y-6">
                {fields.map((item, index) => (
                    <div key={item.id} className="p-4 border rounded-lg space-y-4 relative">
                        <div className="grid sm:grid-cols-2 gap-6 items-start">
                            <FormField
                                control={form.control}
                                name={`lineItems.${index}.productId`}
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Product</FormLabel>
                                    <Select
                                        onValueChange={(value) => {
                                            field.onChange(value);
                                            const productName = uniqueProducts?.find(p => p.id === value)?.name || 'Other';
                                            form.setValue(`lineItems.${index}.productName`, productName);
                                        }}
                                        value={field.value}
                                    >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={isLoadingProducts ? "Loading products..." : "Select a product"} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {uniqueProducts?.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                        <SelectItem value="other">Other (please specify in details)</SelectItem>
                                    </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`lineItems.${index}.quantity`}
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Quantity</FormLabel>
                                    <FormControl>
                                    <Input type="number" placeholder="e.g., 500" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </div>
                        {fields.length > 1 && (
                             <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => remove(index)}
                                className="absolute top-2 right-2 px-2"
                            >
                                <Trash2 className="h-4 w-4 mr-1" /> Remove
                            </Button>
                        )}
                    </div>
                ))}
                <FormMessage>{form.formState.errors.lineItems?.message}</FormMessage>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => append({ productId: '', productName: '', quantity: 100 })}
                >
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Another Product
                </Button>
              </div>

                <FormItem>
                    <FormLabel>Upload Artwork</FormLabel>
                    <FormControl>
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted transition">
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
                                <p className="text-xs text-muted-foreground">PDF, AI, PSD, PNG, JPG (MAX. 25MB)</p>
                            </div>
                            <Input 
                                type="file" 
                                className="hidden"
                                multiple
                                onChange={handleFileChange}
                                disabled={isUploading}
                            />
                        </label>
                    </FormControl>
                        {artworkFields.length > 0 && (
                        <div className="mt-4 space-y-2">
                            <h4 className="text-sm font-medium">Attached files:</h4>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {artworkFields.map((field, index) => {
                                    const fileName = decodeURIComponent(field.value.split('/').pop()?.split('?')[0] || 'file');
                                    return (
                                        <li key={field.id} className="flex items-center justify-between p-2 rounded-md border bg-muted/50 text-sm">
                                            <div className="flex items-center gap-2 truncate">
                                                <FileIcon className="h-4 w-4 shrink-0" />
                                                <a href={field.value} target="_blank" rel="noopener noreferrer" className="truncate hover:underline">{fileName}</a>
                                            </div>
                                            <Button type="button" variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => removeArtwork(index)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    )}
                    <FormDescription>
                        Upload your logo or design files if you have them.
                    </FormDescription>
                    <FormMessage />
                </FormItem>

              <FormField
                control={form.control}
                name="details"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Details (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us about your project, including size, colors, materials, and any other specifications."
                        className="min-h-[150px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSubmitting || isUploading} size="lg" className="w-full sm:w-auto">
                {isSubmitting ? (
                    <>
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        Submitting Request...
                    </>
                ) : (
                    'Submit Quote Request'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}


export default function QuotePage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><LoaderCircle className="h-8 w-8 animate-spin" /></div>}>
            <QuoteForm />
        </Suspense>
    )
}
