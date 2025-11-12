
'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle, LoaderCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
} from "@/components/ui/alert-dialog";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCollection, useFirestore, useMemoFirebase, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const getStatusVariant = (status: string) => {
    switch (status) {
        case 'won':
            return 'default';
        case 'sent':
            return 'secondary';
        case 'draft':
            return 'outline';
        case 'lost':
            return 'destructive';
        default:
            return 'outline';
    }
};

export default function QuotesPage() {
    const router = useRouter();
    const firestore = useFirestore();
    const { toast } = useToast();
    const quotesRef = useMemoFirebase(() => firestore ? collection(firestore, 'quotes') : null, [firestore]);
    const { data: quotes, isLoading } = useCollection<any>(quotesRef);

    const handleDelete = (quoteId: string) => {
        if (!firestore) return;
        const quoteDocRef = doc(firestore, 'quotes', quoteId);
        deleteDocumentNonBlocking(quoteDocRef);
        toast({
            title: 'Quote Deleted',
            description: 'The quote has been successfully deleted.',
        });
    }

    const handleConvertToOrder = (quoteId: string) => {
        if (!firestore) return;
        const quoteDocRef = doc(firestore, 'quotes', quoteId);
        updateDocumentNonBlocking(quoteDocRef, { status: 'won' });
        toast({
            title: 'Quote Converted!',
            description: 'The quote status has been updated to "won".',
        });
    };

    return (
        <>
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Quotes</h1>
                <Button asChild>
                    <Link href="/admin/quotes/new">
                        <PlusCircle className="mr-2 h-4 w-4" /> Create New Quote
                    </Link>
                </Button>
            </div>
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>All Quotes</CardTitle>
                    <CardDescription>Manage all admin-generated quotes.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Customer</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Date Created</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>
                                    <span className="sr-only">Actions</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        <LoaderCircle className="mx-auto h-8 w-8 animate-spin" />
                                    </TableCell>
                                </TableRow>
                            ) : quotes && quotes.length > 0 ? quotes.map(quote => (
                                <TableRow key={quote.id}>
                                    <TableCell className="font-medium">{quote.company || quote.email}</TableCell>
                                    <TableCell>₦{quote.total?.toLocaleString() || '0'}</TableCell>
                                    <TableCell>
                                        {quote.createdAt ? format(quote.createdAt.toDate(), 'PPP') : 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(quote.status || 'draft')} className="capitalize">
                                            {quote.status || 'draft'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <AlertDialog>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button aria-haspopup="true" size="icon" variant="ghost">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                        <span className="sr-only">Toggle menu</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/admin/quotes/${quote.id}`}>View/Edit</Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleConvertToOrder(quote.id)}>
                                                        Convert to Order
                                                    </DropdownMenuItem>
                                                    <AlertDialogTrigger asChild>
                                                        <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>Delete</DropdownMenuItem>
                                                    </AlertDialogTrigger>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                             <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete this quote.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(quote.id)} className="bg-destructive hover:bg-destructive/90">
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        No quotes found. Create one to get started.
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
