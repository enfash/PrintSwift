
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
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const quotes = [
    { id: 'QT-001', customer: 'Alice Johnson', product: 'Business Cards', date: '2023-10-26', status: 'Pending' },
    { id: 'QT-002', customer: 'Ben Carter', product: '12oz Paper Cup', date: '2023-10-25', status: 'Sent' },
    { id: 'QT-003', customer: 'Cathy Davis', product: 'Roll-Up Banner', date: '2023-10-24', status: 'Approved' },
];

const getStatusVariant = (status: string) => {
    switch (status) {
        case 'Approved':
            return 'default';
        case 'Sent':
            return 'secondary';
        case 'Pending':
            return 'outline';
        default:
            return 'secondary';
    }
};

export default function QuotesPage() {
    const router = useRouter();
    return (
        <>
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Quote Requests</h1>
                <Button asChild>
                    <Link href="/admin/quotes/new">
                        <PlusCircle className="mr-2 h-4 w-4" /> Create New Quote
                    </Link>
                </Button>
            </div>
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>All Quote Requests</CardTitle>
                    <CardDescription>Review and manage customer quote inquiries.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Quote ID</TableHead>
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
                            {quotes.length > 0 ? quotes.map(quote => (
                                <TableRow key={quote.id} onClick={() => router.push('/admin/quotes/new')} className="cursor-pointer">
                                    <TableCell className="font-medium">{quote.id}</TableCell>
                                    <TableCell>{quote.customer}</TableCell>
                                    <TableCell>{quote.product}</TableCell>
                                    <TableCell>{quote.date}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(quote.status)}>
                                            {quote.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">Toggle menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                                <DropdownMenuItem>Convert to Order</DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
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
