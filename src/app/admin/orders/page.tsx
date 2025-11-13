
'use client';

import React, { useState } from 'react';
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
import { ArrowRight, ChevronLeft, ChevronRight, FileText, Upload, Download, LoaderCircle, File as FileIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCollection, useFirestore, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import Link from 'next/link';

const getStatusVariant = (status: string) => {
    switch (status) {
        case 'Delivered': return 'default';
        case 'In Production':
        case 'Ready for Dispatch': return 'secondary';
        case 'Awaiting Pay': return 'outline';
        default: return 'secondary';
    }
};

const productionStatuses = [
    'Awaiting Artwork', 'In Prepress', 'Printing', 'In Production', 
    'Finishing', 'QA', 'Ready for Dispatch', 'Dispatched', 'Delivered'
];

export default function OrdersPage() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [selectedOrder, setSelectedOrder] = useState<any>(null);

    const ordersQuery = useMemoFirebase(
        () => firestore ? query(collection(firestore, 'quotes'), where('status', '==', 'won')) : null,
        [firestore]
    );
    const { data: orders, isLoading } = useCollection<any>(ordersQuery);

    const handleSelectOrder = (order: any) => {
        setSelectedOrder(order);
    };

    const handleStatusChange = (newStatus: string) => {
        if (!selectedOrder || !firestore) return;
        
        const updatedOrder = { ...selectedOrder, productionStatus: newStatus };
        setSelectedOrder(updatedOrder);

        const orderRef = doc(firestore, 'quotes', selectedOrder.id);
        updateDocumentNonBlocking(orderRef, { productionStatus: newStatus });
        toast({
            title: "Order Status Updated",
            description: `Order #${selectedOrder.id.substring(0,6)} is now "${newStatus}".`
        });
    };

    return (
        <div className="grid gap-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Orders</CardTitle>
                            <CardDescription>View and manage all active customer orders.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                             <Input placeholder="Search..." className="w-64" />
                             <Select><SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger></Select>
                             <Select><SelectTrigger className="w-40"><SelectValue placeholder="Date" /></SelectTrigger></Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead>Total ₦</TableHead>
                                <TableHead>Prod. Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        <LoaderCircle className="mx-auto h-8 w-8 animate-spin" />
                                    </TableCell>
                                </TableRow>
                            ) : orders && orders.length > 0 ? (
                                orders.map(order => (
                                <TableRow key={order.id} className="cursor-pointer" onClick={() => handleSelectOrder(order)}>
                                    <TableCell className="font-medium">#{order.id.substring(0, 6)}</TableCell>
                                    <TableCell>{order.company || order.email}</TableCell>
                                    <TableCell>{order.createdAt ? format(order.createdAt.toDate(), 'PPP') : 'N/A'}</TableCell>
                                    <TableCell>{order.total.toLocaleString()}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(order.productionStatus || 'Awaiting Artwork')}>
                                            {order.productionStatus || 'Awaiting Artwork'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleSelectOrder(order); }}>
                                            View <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        No active orders found. Convert a "won" quote to see it here.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
                <CardContent className="flex justify-end items-center gap-2">
                     <Button variant="outline" size="icon"><ChevronLeft className="h-4 w-4" /></Button>
                     <span>1 / {orders ? Math.ceil(orders.length / 10) : 1}</span>
                     <Button variant="outline" size="icon"><ChevronRight className="h-4 w-4" /></Button>
                </CardContent>
            </Card>

            <Separator />
            
            {selectedOrder ? (
            <>
            <h2 className="text-2xl font-bold">Order Detail (#{selectedOrder.id.substring(0, 6)})</h2>
            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Items</CardTitle></CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Qty</TableHead>
                                        <TableHead>Options</TableHead>
                                        <TableHead className="text-right">Line Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                   {selectedOrder.lineItems.map((item: any, index: number) => (
                                        <TableRow key={index}>
                                            <TableCell>{item.productName}</TableCell>
                                            <TableCell>{item.qty}</TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {item.options?.map((opt: any) => `${opt.label}: ${opt.value}`).join(', ')}
                                            </TableCell>
                                            <TableCell className="text-right">₦ {(item.unitPrice * item.qty).toLocaleString()}</TableCell>
                                        </TableRow>
                                   ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader><CardTitle>Production</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                             <div>
                                <h4 className="font-medium mb-2">Production Status</h4>
                                <Select value={selectedOrder.productionStatus || 'Awaiting Artwork'} onValueChange={handleStatusChange}>
                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                    <SelectContent>
                                        {productionStatuses.map(status => (
                                            <SelectItem key={status} value={status}>{status}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                             </div>
                             <div className="grid sm:grid-cols-3 gap-4">
                                <div><h4 className="font-medium mb-2">Assign To</h4> <Select><SelectTrigger><SelectValue placeholder="Select user"/></SelectTrigger></Select></div>
                                <div><h4 className="font-medium mb-2">ETA</h4> <Input type="date"/></div>
                                <div><h4 className="font-medium mb-2">Priority</h4> <Select defaultValue="normal"><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="normal">Normal</SelectItem><SelectItem value="high">High</SelectItem></SelectContent></Select></div>
                             </div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
                        <CardContent className="grid sm:grid-cols-2 gap-4">
                            <Textarea placeholder="Internal notes..." defaultValue={selectedOrder.notesInternal} />
                            <Textarea placeholder="Customer notes..." defaultValue={selectedOrder.notesCustomer} />
                        </CardContent>
                         <CardContent className="flex justify-end pt-0">
                            <Button variant="outline">Save Notes</Button>
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-6">
                    <Card>
                         <CardHeader><CardTitle>Timeline</CardTitle></CardHeader>
                         <CardContent className="space-y-4 text-sm">
                            <p>• Quote Won <span className="text-muted-foreground">{selectedOrder.updatedAt ? format(selectedOrder.updatedAt.toDate(), 'p') : ''}</span></p>
                            <p>• Order Created <span className="text-muted-foreground">{selectedOrder.createdAt ? format(selectedOrder.createdAt.toDate(), 'p') : ''}</span></p>
                         </CardContent>
                    </Card>
                     <Card>
                        <CardHeader><CardTitle>Shipping & Billing</CardTitle></CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <p className="font-medium">{selectedOrder.company}</p>
                            <p className="text-muted-foreground">{selectedOrder.email}</p>
                             <p className="text-muted-foreground">{selectedOrder.phone}</p>
                            <Separator className="my-4" />
                            <div className="flex items-center justify-between">
                                <span className="font-medium">Delivery:</span>
                                <Select defaultValue="bike"><SelectTrigger className="w-32"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="bike">Bike</SelectItem><SelectItem value="courier">Courier</SelectItem><SelectItem value="pickup">Pickup</SelectItem></SelectContent></Select>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="font-medium">Tracking #:</span>
                                <Input className="w-32 h-8" placeholder="Enter number"/>
                            </div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader><CardTitle>Artwork Files</CardTitle></CardHeader>
                         <CardContent>
                            {selectedOrder.artworkUrls && selectedOrder.artworkUrls.length > 0 ? (
                                <ul className="space-y-2">
                                    {selectedOrder.artworkUrls.map((url: string, index: number) => {
                                        const fileName = decodeURIComponent(url.split('/').pop()?.split('?')[0] || 'file');
                                        return (
                                            <li key={index} className="flex items-center justify-between p-2 rounded-md border text-sm">
                                                <Link href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 truncate hover:underline">
                                                    <FileIcon className="h-4 w-4 shrink-0" />
                                                    <span className="truncate">{fileName}</span>
                                                </Link>
                                                <Button asChild variant="ghost" size="icon" className="h-6 w-6">
                                                   <a href={url} download={fileName}><Download className="h-4 w-4" /></a>
                                                </Button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">No artwork files for this order.</p>
                            )}
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader><CardTitle>Payments</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between text-sm"><span>Total:</span> <span className="font-medium">₦{selectedOrder.total.toLocaleString()}</span></div>
                            <div className="flex justify-between text-sm"><span>Paid:</span> <span className="font-medium">₦0</span></div>
                            <Button className="w-full">Record Payment</Button>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader><CardTitle>Actions</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-2 gap-2">
                             <Button variant="secondary">Email Update</Button>
                             <Button variant="secondary">Issue Invoice</Button>
                             <Button variant="destructive">Refund</Button>
                             <Button variant="destructive" >Cancel Order</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
            </>
            ) : (
                 <Card>
                    <CardContent className="py-24 text-center text-muted-foreground">
                        <p>Select an order from the table above to see its details.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
