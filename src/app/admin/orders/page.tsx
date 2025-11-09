
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
import { ArrowRight, ChevronLeft, ChevronRight, FileText, Upload, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';


const orders = [
    { id: '#412', customer: 'Ada Ventures', date: '2025-11-12', total: '185,500', status: 'In Production' },
    { id: '#413', customer: 'Jide Stores', date: '2025-11-12', total: '45,000', status: 'Awaiting Pay' },
    { id: '#414', customer: 'Lagos Tech Hub', date: '2025-11-11', total: '250,000', status: 'Delivered' },
    { id: '#415', customer: 'The Food Place', date: '2025-11-10', total: '88,000', status: 'Ready for Dispatch' },
];

const getStatusVariant = (status: string) => {
    switch (status) {
        case 'Delivered':
            return 'default';
        case 'In Production':
        case 'Ready for Dispatch':
            return 'secondary';
        case 'Awaiting Pay':
            return 'outline';
        default:
            return 'secondary';
    }
};

export default function OrdersPage() {
    return (
        <div className="grid gap-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Orders</CardTitle>
                            <CardDescription>View and manage all customer orders.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                             <Input placeholder="Search..." className="w-64" />
                             <Select>
                                <SelectTrigger className="w-40">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="in-production">In Production</SelectItem>
                                    <SelectItem value="awaiting-pay">Awaiting Payment</SelectItem>
                                </SelectContent>
                             </Select>
                             <Select>
                                <SelectTrigger className="w-40">
                                    <SelectValue placeholder="Date" />
                                </SelectTrigger>
                             </Select>
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
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.map(order => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium">{order.id}</TableCell>
                                    <TableCell>{order.customer}</TableCell>
                                    <TableCell>{order.date}</TableCell>
                                    <TableCell>{order.total}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(order.status)}>
                                            {order.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm">View <ArrowRight className="ml-2 h-4 w-4" /></Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
                <CardContent className="flex justify-end items-center gap-2">
                     <Button variant="outline" size="icon"><ChevronLeft className="h-4 w-4" /></Button>
                     <span>1 / 10</span>
                     <Button variant="outline" size="icon"><ChevronRight className="h-4 w-4" /></Button>
                </CardContent>
            </Card>

            <Separator />
            
            <h2 className="text-2xl font-bold">Order Detail (#412)</h2>
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
                                    <TableRow>
                                        <TableCell>Business Cards</TableCell>
                                        <TableCell>500</TableCell>
                                        <TableCell className="text-xs text-muted-foreground">300gsm, Matte, RC, 4/4</TableCell>
                                        <TableCell className="text-right">₦ 120,000</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Roll-up Banner</TableCell>
                                        <TableCell>2</TableCell>
                                        <TableCell className="text-xs text-muted-foreground">85x200, Eco Solvent</TableCell>
                                        <TableCell className="text-right">₦ 65,500</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader><CardTitle>Production</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                             <div>
                                <h4 className="font-medium mb-2">Production Status</h4>
                                <Select defaultValue="in-production">
                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="awaiting-artwork">Awaiting Artwork</SelectItem>
                                        <SelectItem value="in-prepress">In Prepress</SelectItem>
                                        <SelectItem value="printing">Printing</SelectItem>
                                        <SelectItem value="in-production">In Production</SelectItem>
                                        <SelectItem value="qa">QA</SelectItem>
                                        <SelectItem value="ready">Ready for Dispatch</SelectItem>
                                        <SelectItem value="dispatched">Dispatched</SelectItem>
                                        <SelectItem value="delivered">Delivered</SelectItem>
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
                            <Textarea placeholder="Internal notes..." />
                            <Textarea placeholder="Customer notes..." />
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
                            <p>• Order Placed <span className="text-muted-foreground">09:18</span></p>
                            <p>• Payment Confirmed <span className="text-muted-foreground">09:25</span></p>
                            <p>• In Production <span className="text-muted-foreground">11:00</span></p>
                         </CardContent>
                    </Card>
                     <Card>
                        <CardHeader><CardTitle>Shipping & Billing</CardTitle></CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <p className="font-medium">Ada Ventures</p>
                            <p className="text-muted-foreground">123 Tech Road, Yaba, Lagos</p>
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
                        <CardHeader><CardTitle>Files</CardTitle></CardHeader>
                        <CardContent className="flex flex-col gap-2">
                            <Button variant="outline"><Upload className="mr-2 h-4 w-4"/> Upload Artwork</Button>
                            <Button variant="outline"><Upload className="mr-2 h-4 w-4"/> Upload Proof</Button>
                            <Button variant="secondary"><Download className="mr-2 h-4 w-4"/> Download Approved PDF</Button>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader><CardTitle>Payments</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between text-sm"><span>Paid:</span> <span className="font-medium">₦123,250</span></div>
                            <div className="flex justify-between text-sm"><span>Balance:</span> <span className="font-medium">₦62,250</span></div>
                            <Button className="w-full">Record Payment</Button>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader><CardTitle>Actions</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-2 gap-2">
                             <Button variant="secondary">Email Update</Button>
                             <Button variant="secondary">Issue Invoice</Button>
                             <Button variant="destructive">Refund</Button>
                             <Button variant="destructive" >Cancel</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

