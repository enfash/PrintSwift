
'use client';
import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useCollection, useFirestore, useMemoFirebase, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc, writeBatch, query, where } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { format, formatDistanceToNow } from 'date-fns';
import Papa from 'papaparse';

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
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  MoreHorizontal,
  LoaderCircle,
  Trash2,
  Search,
  Eye,
  MessageSquare,
  FilePlus2,
  FileText,
  ShoppingCart,
  FileQuestion,
} from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


const CustomerQuickView = ({ customer }: { customer: any }) => {
    const router = useRouter();
    const firestore = useFirestore();

    const quoteRequestsQuery = useMemoFirebase(
      () => firestore ? query(collection(firestore, 'quote_requests'), where('customerId', '==', customer.id)) : null,
      [firestore, customer.id]
    );
    const { data: quoteRequests, isLoading: isLoadingRequests } = useCollection<any>(quoteRequestsQuery);

    const quotesQuery = useMemoFirebase(
      () => firestore ? query(collection(firestore, 'quotes'), where('customerId', '==', customer.id)) : null,
      [firestore, customer.id]
    );
    const { data: quotes, isLoading: isLoadingQuotes } = useCollection<any>(quotesQuery);
    const orders = useMemo(() => quotes?.filter(q => q.status === 'won') || [], [quotes]);

    return (
        <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
                <div className="flex items-center gap-3">
                     <Avatar>
                        <AvatarFallback>{customer.name?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                        <DialogTitle>{customer.name}</DialogTitle>
                        <DialogDescription>{customer.email}</DialogDescription>
                    </div>
                </div>
            </DialogHeader>
            <Tabs defaultValue="details">
                <TabsList>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="requests">Requests ({isLoadingRequests ? '...' : quoteRequests?.length || 0})</TabsTrigger>
                    <TabsTrigger value="orders">Orders ({isLoadingQuotes ? '...' : orders.length || 0})</TabsTrigger>
                </TabsList>
                <TabsContent value="details" className="pt-4">
                     <div className="space-y-2 text-sm">
                        <p><strong>Phone:</strong> {customer.phone || 'N/A'}</p>
                        <p><strong>Company:</strong> {customer.company || 'N/A'}</p>
                        <p><strong>Notes:</strong> {customer.notes || 'No notes.'}</p>
                        <p className="text-xs text-muted-foreground pt-2">Joined: {customer.createdAt ? format(customer.createdAt.toDate(), 'PPP') : 'N/A'}</p>
                    </div>
                </TabsContent>
                <TabsContent value="requests" className="pt-4">
                     {isLoadingRequests ? <LoaderCircle className="animate-spin" /> : quoteRequests && quoteRequests.length > 0 ? (
                        <div className="space-y-2">
                            {quoteRequests.map((req: any) => (
                                <div key={req.id} className="flex justify-between items-center p-2 border rounded-md">
                                    <div className="flex items-center gap-2">
                                        <FileQuestion className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">{req.productName}</span>
                                    </div>
                                    <Badge variant="secondary">{req.status || 'Pending'}</Badge>
                                </div>
                            ))}
                        </div>
                    ) : <p className="text-sm text-muted-foreground">No quote requests found.</p>}
                </TabsContent>
                 <TabsContent value="orders" className="pt-4">
                     {isLoadingQuotes ? <LoaderCircle className="animate-spin" /> : orders.length > 0 ? (
                        <div className="space-y-2">
                             {orders.map((order: any) => (
                                <div key={order.id} className="flex justify-between items-center p-2 border rounded-md">
                                    <div className="flex items-center gap-2">
                                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">#{order.id.substring(0, 6)} - ₦{order.total.toLocaleString()}</span>
                                    </div>
                                    <Badge>{order.productionStatus || 'Awaiting Artwork'}</Badge>
                                </div>
                            ))}
                        </div>
                    ) : <p className="text-sm text-muted-foreground">No orders found.</p>}
                </TabsContent>
            </Tabs>
             <div className="flex justify-end pt-4">
                <Button onClick={() => router.push(`/admin/quotes/new?customer_id=${customer.id}`)}>
                    <FilePlus2 className="mr-2 h-4 w-4"/> Create Quote
                </Button>
            </div>
        </DialogContent>
    )
}


const CustomerTable = () => {
    const router = useRouter();
    const firestore = useFirestore();
    const { toast } = useToast();
    const customersRef = useMemoFirebase(() => firestore ? collection(firestore, 'customers') : null, [firestore]);
    
    const { data: customers, isLoading: isLoadingCustomers, error: customersError } = useCollection<any>(customersRef);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
    const [page, setPage] = useState(1);
    const rowsPerPage = 10;

    const filteredAndSortedCustomers = useMemo(() => {
        if (!customers) return [];
        let filtered = [...customers];

        if (searchTerm) {
            const lowercasedTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(c => 
                c.name?.toLowerCase().includes(lowercasedTerm) || 
                c.email?.toLowerCase().includes(lowercasedTerm)
            );
        }

        filtered.sort((a, b) => {
            const dateA = a.createdAt?.toDate() || 0;
            const dateB = b.createdAt?.toDate() || 0;
            return dateB - dateA;
        });

        return filtered;
    }, [customers, searchTerm]);
    
    const paginatedCustomers = useMemo(() => {
        const startIndex = (page - 1) * rowsPerPage;
        return filteredAndSortedCustomers.slice(startIndex, startIndex + rowsPerPage);
    }, [filteredAndSortedCustomers, page, rowsPerPage]);

    const totalPages = Math.ceil(filteredAndSortedCustomers.length / rowsPerPage);

    const handleDelete = (customerId: string) => {
        if (!firestore) return;
        deleteDocumentNonBlocking(doc(firestore, 'customers', customerId));
        toast({ title: 'Customer Deleted' });
        setSelectedCustomers(prev => prev.filter(id => id !== customerId));
    }

    const handleMultiDelete = async () => {
        if (!firestore || selectedCustomers.length === 0) return;
        const batch = writeBatch(firestore);
        selectedCustomers.forEach(id => {
            batch.delete(doc(firestore, 'customers', id));
        });
        await batch.commit();
        toast({
            title: 'Customers Deleted',
            description: `${selectedCustomers.length} customers have been deleted.`,
        });
        setSelectedCustomers([]);
    };

    const handleSelectAll = (checked: boolean | string) => {
        if (checked) {
            setSelectedCustomers(paginatedCustomers.map(c => c.id));
        } else {
            setSelectedCustomers([]);
        }
    };
    
    const handleSelectCustomer = (customerId: string, checked: boolean | string) => {
        setSelectedCustomers(prev => 
            checked ? [...prev, customerId] : prev.filter(id => id !== customerId)
        );
    };
    
    const exportCSV = () => {
        const dataToExport = selectedCustomers.length > 0 
            ? customers?.filter(c => selectedCustomers.includes(c.id))
            : filteredAndSortedCustomers;

        if (!dataToExport || dataToExport.length === 0) {
            toast({ variant: 'destructive', title: 'Export Failed', description: 'No customers to export.' });
            return;
        }

        const csv = Papa.unparse(dataToExport.map(c => ({
          name: c.name, email: c.email, phone: c.phone || '', company: c.company || '', createdAt: c.createdAt?.toDate?.().toISOString()
        })));
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `bomedia-customers-${Date.now()}.csv`; a.click();
        URL.revokeObjectURL(url);
    }
    
    useEffect(() => {
        const handler = () => exportCSV();
        document.addEventListener('export-customers-csv', handler);
        return () => document.removeEventListener('export-customers-csv', handler);
    }, [exportCSV]);

    if (customersError) {
        return <p>Error: {customersError.message}</p>;
    }
    
    const SkeletonRow = () => (
      <TableRow>
        <TableCell className="w-[40px]"><Skeleton className="h-4 w-4" /></TableCell>
        <TableCell className="font-medium flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-[120px]" />
            <Skeleton className="h-3 w-[150px]" />
          </div>
        </TableCell>
        <TableCell><Skeleton className="h-4 w-[180px]" /></TableCell>
        <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
        <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
        <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
      </TableRow>
    );

    return (
        <Card className="mt-6 shadow-sm">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <div className="relative flex-grow">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search by name or email..." 
                            className="pl-8"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                     {selectedCustomers.length > 0 && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete ({selectedCustomers.length})
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action will permanently delete {selectedCustomers.length} customer(s).
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleMultiDelete} className="bg-destructive hover:bg-destructive/90">
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[40px]">
                                <Checkbox 
                                    onCheckedChange={handleSelectAll}
                                    checked={selectedCustomers.length === paginatedCustomers.length && paginatedCustomers.length > 0}
                                    aria-label="Select all current page"
                                />
                            </TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Company</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoadingCustomers ? (
                            Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                        ) : paginatedCustomers.length > 0 ? paginatedCustomers.map(customer => (
                            <TableRow key={customer.id} data-state={selectedCustomers.includes(customer.id) && "selected"}>
                                <TableCell>
                                    <Checkbox
                                        checked={selectedCustomers.includes(customer.id)}
                                        onCheckedChange={(checked) => handleSelectCustomer(customer.id, checked)}
                                        aria-label={`Select ${customer.name}`}
                                    />
                                </TableCell>
                                <TableCell className="font-medium flex items-center gap-3">
                                  <Avatar>
                                    <AvatarFallback>{customer.name?.charAt(0).toUpperCase()}</AvatarFallback>
                                  </Avatar>
                                   <div>
                                    {customer.name}
                                    <div className="text-xs text-muted-foreground">{customer.email}</div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center justify-between">
                                        <span>{customer.phone}</span>
                                        <a href={`https://wa.me/${customer.phone?.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="ml-2">
                                            <MessageSquare className="h-4 w-4 text-green-500 hover:text-green-600"/>
                                        </a>
                                    </div>
                                </TableCell>
                                <TableCell>{customer.company || 'N/A'}</TableCell>
                                <TableCell className="text-muted-foreground text-xs">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                {customer.createdAt ? `${formatDistanceToNow(customer.createdAt.toDate())} ago` : 'N/A'}
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{customer.createdAt ? format(customer.createdAt.toDate(), 'PPP p') : 'No date'}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </TableCell>
                                <TableCell className="text-right">
                                  <Dialog>
                                    <AlertDialog>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DialogTrigger asChild>
                                                  <DropdownMenuItem><Eye className="mr-2 h-4 w-4"/>Quick View</DropdownMenuItem>
                                                </DialogTrigger>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/admin/customers/${customer.id}`}>Edit</Link>
                                                </DropdownMenuItem>
                                                <AlertDialogTrigger asChild>
                                                    <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                                                </AlertDialogTrigger>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This will permanently delete {customer.name}.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(customer.id)} className="bg-destructive hover:bg-destructive/90">
                                                    Delete
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                    <CustomerQuickView customer={customer} />
                                  </Dialog>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No customers found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                <div className="flex items-center justify-end space-x-2 py-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                    >
                        Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        Page {page} of {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                    >
                        Next
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default CustomerTable;
