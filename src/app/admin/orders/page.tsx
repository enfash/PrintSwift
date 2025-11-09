
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
import { MoreHorizontal, File } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const orders = [
    { id: 'ORD-001', customer: 'Alice Johnson', date: '2023-10-26', status: 'Processing', total: '₦55,000' },
    { id: 'ORD-002', customer: 'Ben Carter', date: '2023-10-25', status: 'Shipped', total: '₦120,000' },
    { id: 'ORD-003', customer: 'Cathy Davis', date: '2023-10-24', status: 'Delivered', total: '₦75,000' },
];

const getStatusVariant = (status: string) => {
    switch (status) {
        case 'Delivered':
            return 'default';
        case 'Shipped':
            return 'secondary';
        case 'Processing':
            return 'outline';
        default:
            return 'secondary';
    }
};

export default function OrdersPage() {
    return (
        <Tabs defaultValue="all">
            <div className="flex items-center">
                <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
                <div className="ml-auto flex items-center gap-2">
                    <TabsList>
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="processing">Processing</TabsTrigger>
                        <TabsTrigger value="shipped">Shipped</TabsTrigger>
                        <TabsTrigger value="delivered">Delivered</TabsTrigger>
                    </TabsList>
                    <Button variant="outline" size="sm" className="h-8 gap-1">
                        <File className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Export
                        </span>
                    </Button>
                </div>
            </div>
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>All Orders</CardTitle>
                    <CardDescription>View and manage customer orders.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead>
                                    <span className="sr-only">Actions</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.length > 0 ? orders.map(order => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium">{order.id}</TableCell>
                                    <TableCell>{order.customer}</TableCell>
                                    <TableCell>{order.date}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(order.status)}>
                                            {order.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">{order.total}</TableCell>
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
                                                <DropdownMenuItem>View Order</DropdownMenuItem>
                                                <DropdownMenuItem>View Shipping Details</DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive">Archive</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        No orders found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </Tabs>
    );
}
