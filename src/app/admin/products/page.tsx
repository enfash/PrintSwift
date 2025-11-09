
'use client';

import Image from 'next/image';
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
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Mock data based on wireframe
const products = [
    { id: '1', name: 'Business Cards', category: 'Prints', status: 'Published', imageUrl: 'https://picsum.photos/seed/1/40/40' },
    { id: '2', name: '12oz Paper Cup', category: 'Cups', status: 'Published', imageUrl: 'https://picsum.photos/seed/2/40/40' },
    { id: '3', name: 'Roll-Up Banner', category: 'Banners', status: 'Draft', imageUrl: 'https://picsum.photos/seed/3/40/40' },
];

export default function ProductsPage() {
    return (
        <>
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Products</h1>
                <Button asChild>
                    <Link href="/admin/products/new">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add New Product
                    </Link>
                </Button>
            </div>
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>All Products</CardTitle>
                    <CardDescription>Manage your store's products here.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="hidden w-[100px] sm:table-cell">
                                    <span className="sr-only">Image</span>
                                </TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>
                                    <span className="sr-only">Actions</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.length > 0 ? products.map(product => (
                                <TableRow key={product.id}>
                                    <TableCell className="hidden sm:table-cell">
                                        <Image
                                            alt={product.name}
                                            className="aspect-square rounded-md object-cover"
                                            height="40"
                                            src={product.imageUrl}
                                            width="40"
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">{product.name}</TableCell>
                                    <TableCell>{product.category}</TableCell>
                                    <TableCell>
                                        <Badge variant={product.status === 'Published' ? 'default' : 'secondary'}>
                                            {product.status}
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
                                                <DropdownMenuItem>Edit</DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        No products found.
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

    