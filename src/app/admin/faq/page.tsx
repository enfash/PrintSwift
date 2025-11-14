
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle, LoaderCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { useCollection, useFirestore, useMemoFirebase, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

const faqSchema = z.object({
  question: z.string().min(10, 'Question must be at least 10 characters.'),
  answer: z.string().min(10, 'Answer must be at least 10 characters.'),
  category: z.string().min(2, 'Category is required.'),
  visible: z.boolean().default(true),
});

type FaqFormValues = z.infer<typeof faqSchema>;

function FaqForm({ onFinished, currentFaq }: { onFinished: () => void, currentFaq?: any }) {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<FaqFormValues>({
        resolver: zodResolver(faqSchema),
        defaultValues: currentFaq || {
            question: '',
            answer: '',
            category: 'General',
            visible: true,
        }
    });

    const onSubmit = async (values: FaqFormValues) => {
        if (!firestore) return;
        setIsSubmitting(true);

        try {
            if (currentFaq?.id) {
                const faqDocRef = doc(firestore, 'faqs', currentFaq.id);
                await updateDocumentNonBlocking(faqDocRef, values);
                toast({ title: 'FAQ Updated' });
            } else {
                const faqsCollection = collection(firestore, 'faqs');
                const newDocRef = doc(faqsCollection);
                await updateDocumentNonBlocking(doc(firestore, 'faqs', newDocRef.id), { ...values, id: newDocRef.id });
                toast({ title: 'FAQ Created' });
            }
            onFinished();
        } catch (error) {
            console.error("Error saving FAQ:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not save the FAQ.' });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const title = currentFaq ? 'Edit FAQ' : 'Add New FAQ';

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <FormField
                    control={form.control}
                    name="question"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Question</FormLabel>
                            <FormControl><Input placeholder="e.g., What is your turnaround time?" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="answer"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Answer</FormLabel>
                            <FormControl><Textarea rows={5} placeholder="Our standard turnaround is..." {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="grid grid-cols-2 gap-6">
                     <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Category</FormLabel>
                                <FormControl><Input placeholder="e.g., Shipping" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="visible"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                <div className="space-y-0.5">
                                    <FormLabel>Visible</FormLabel>
                                </div>
                                <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                    Save FAQ
                </Button>
            </form>
        </Form>
    );
}


export default function FaqAdminPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const faqsRef = useMemoFirebase(() => firestore ? collection(firestore, 'faqs') : null, [firestore]);
  const { data: faqs, isLoading } = useCollection<any>(faqsRef);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<any | null>(null);

  const toggleVisibility = (id: string, currentVisibility: boolean) => {
    if (!firestore) return;
    const faqDocRef = doc(firestore, 'faqs', id);
    updateDocumentNonBlocking(faqDocRef, { visible: !currentVisibility });
    toast({ title: 'Visibility Updated' });
  };

  const handleDelete = (id: string) => {
    if (!firestore) return;
    const faqDocRef = doc(firestore, 'faqs', id);
    deleteDocumentNonBlocking(faqDocRef);
    toast({ title: 'FAQ Deleted' });
  };

  const handleEdit = (faq: any) => {
    setEditingFaq(faq);
    setIsFormOpen(true);
  };
  
  const handleAddNew = () => {
    setEditingFaq(null);
    setIsFormOpen(true);
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Manage FAQs</h1>
        <Button onClick={handleAddNew}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add FAQ
        </Button>
      </div>
       <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
            <FaqForm 
                onFinished={() => setIsFormOpen(false)}
                currentFaq={editingFaq}
            />
        </DialogContent>
      </Dialog>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>All FAQs</CardTitle>
          <CardDescription>Manage questions and answers for the public FAQ page.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Question</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Visible</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    <LoaderCircle className="mx-auto h-8 w-8 animate-spin" />
                  </TableCell>
                </TableRow>
              ) : faqs && faqs.length > 0 ? (
                faqs.map((faq) => (
                  <TableRow key={faq.id}>
                    <TableCell className="font-medium max-w-md truncate">{faq.question}</TableCell>
                    <TableCell>
                        <Badge variant="secondary">{faq.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={faq.visible}
                        onCheckedChange={() => toggleVisibility(faq.id, faq.visible)}
                      />
                    </TableCell>
                    <TableCell>
                      <AlertDialog>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onSelect={() => handleEdit(faq)}>Edit</DropdownMenuItem>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                            </AlertDialogTrigger>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete this FAQ.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(faq.id)} className="bg-destructive hover:bg-destructive/90">
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No FAQs found. Add one to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
