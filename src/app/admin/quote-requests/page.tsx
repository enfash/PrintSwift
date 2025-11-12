
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
import { MoreHorizontal, LoaderCircle, ArrowRight } from 'lucide-react';
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
import { useRouter } from 'next/navigation';
import { useCollection, useFirestore, useMemoFirebase, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const getStatusVariant = (status: string) => {
    switch (status) {
        case 'Converted':
            return 'default';
        case 'Pending':
            return 'secondary';
        case 'Archived':
            return 'outline';
        default:
            return 'outline';
    }
};

export default function QuoteRequestsPage() {
    const router = useRouter();
    const firestore = useFirestore();
    const { toast } = useToast();
    const quoteRequestsRef = useMemoFirebase(() => firestore ? collection(firestore, 'quote_requests') : null, [firestore]);
    const { data: requests, isLoading } = useCollection<any>(quoteRequestsRef);

    const handleDelete = (requestId: string) => {
        if (!firestore) return;
        const requestDocRef = doc(firestore, 'quote_requests', requestId);
        deleteDocumentNonBlocking(requestDocRef);
        toast({
            title: 'Request Deleted',
            description: 'The quote request has been successfully deleted.',
        });
    }

    const handleCreateQuote = (request: any) => {
        // Here you would typically pass the request data to the new quote page,
        // for example via query params or state management.
        router.push(`/admin/quotes/new?request_id=${request.id}`);
    }

    return (
        <>
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Quote Requests</h1>
            </div>
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Incoming Requests</CardTitle>
                    <CardDescription>Review new quote requests submitted by customers.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Customer</TableHead>
                                <TableHead>Product</TableHead>
                                <TableHead>Date</TableHead>
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
                            ) : requests && requests.length > 0 ? requests.map(request => (
                                <TableRow key={request.id}>
                                    <TableCell>
                                        <div className="font-medium">{request.name}</div>
                                        <div className="text-sm text-muted-foreground">{request.email}</div>
                                    </TableCell>
                                    <TableCell>{request.productName}</TableCell>
                                    <TableCell>
                                        {request.submissionDate ? format(request.submissionDate.toDate(), 'PPP') : 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(request.status || 'Pending')} className="capitalize">
                                            {request.status || 'Pending'}
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
                                                    <DropdownMenuItem onClick={() => handleCreateQuote(request)}>
                                                        Create Quote <ArrowRight className="ml-auto h-4 w-4" />
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
                                                        This action cannot be undone. This will permanently delete this quote request.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(request.id)} className="bg-destructive hover:bg-destructive/90">
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
                                        No quote requests found.
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

    