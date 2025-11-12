
'use client';

import { useForm } from 'react-hook-form';
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
import { LoaderCircle, UploadCloud } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState, Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  useCollection,
  useFirestore,
  addDocumentNonBlocking,
  useMemoFirebase,
} from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';

const quoteFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  phone: z.string().min(10, { message: 'Please enter a valid phone number.'}),
  company: z.string().optional(),
  productName: z.string({ required_error: 'Please select a product.' }),
  quantity: z.coerce.number().min(1, { message: 'Quantity must be at least 1.' }),
  artwork: z.any().optional(),
  details: z.string().min(10, { message: 'Please provide at least a brief description.' }),
});

function QuoteForm() {
  const searchParams = useSearchParams();
  const productNameQuery = searchParams.get('product');
  const firestore = useFirestore();

  const productsRef = useMemoFirebase(() => firestore ? collection(firestore, 'products') : null, [firestore]);
  const { data: products, isLoading: isLoadingProducts } = useCollection<any>(productsRef);

  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileName, setFileName] = useState('');

  const form = useForm<z.infer<typeof quoteFormSchema>>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      company: '',
      productName: productNameQuery || undefined,
      quantity: 1,
      details: '',
    },
  });

  useEffect(() => {
    if (productNameQuery) {
        form.setValue('productName', productNameQuery);
    }
  }, [productNameQuery, form]);

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
    const selectedProduct = products?.find(p => p.name === values.productName);

    try {
        await addDocumentNonBlocking(quoteRequestsRef, {
            ...values,
            productId: selectedProduct?.id || 'other',
            submissionDate: serverTimestamp(),
            status: 'Pending', // Add a default status
        });

        setIsSubmitting(false);
        form.reset();
        setFileName('');
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
              <div className="grid sm:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="productName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={isLoadingProducts ? "Loading products..." : "Select a product"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {products?.map(p => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}
                          <SelectItem value="Other">Other (please specify in details)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="quantity"
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

              <FormField
                control={form.control}
                name="artwork"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Upload Artwork</FormLabel>
                        <FormControl>
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted transition">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <UploadCloud className="w-8 h-8 mb-3 text-muted-foreground"/>
                                    {fileName ? (
                                        <p className="text-sm text-foreground">{fileName}</p>
                                    ) : (
                                        <>
                                            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                            <p className="text-xs text-muted-foreground">PDF, AI, PSD, PNG, JPG (MAX. 25MB)</p>
                                        </>
                                    )}
                                </div>
                                <Input 
                                    type="file" 
                                    className="hidden"
                                    onChange={(e) => {
                                        field.onChange(e.target.files);
                                        setFileName(e.target.files?.[0]?.name || '');
                                    }}
                                />
                            </label>
                        </FormControl>
                        <FormDescription>
                            Upload your logo or design file if you have one.
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="details"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Details</FormLabel>
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
              <Button type="submit" disabled={isSubmitting} size="lg" className="w-full sm:w-auto">
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
