
'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
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

const categories = [
    { id: '1', name: 'Paper Cups', slug: 'paper-cups', order: 1, imageUrl: 'https://picsum.photos/seed/cups/40/40' },
    { id: '2', name: 'Stickers', slug: 'stickers', order: 2, imageUrl: 'https://picsum.photos/seed/stickers/40/40' },
    { id: '3', name: 'Banners', slug: 'banners', order: 3, imageUrl: 'https://picsum.photos/seed/banners/40/40' },
];

export default function CategoriesPage() {
    return (
        <>
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Product Categories</h1>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add New Category
                </Button>
            </div>
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>All Categories</CardTitle>
                    <CardDescription>Organize your products into categories.</CardDescription>
                </CardHeader>
                <CardContent>
                   <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="hidden w-[100px] sm:table-cell">Image</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Slug</TableHead>
                                <TableHead>Order</TableHead>
                                <TableHead>
                                    <span className="sr-only">Actions</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.map(category => (
                                <TableRow key={category.id}>
                                     <TableCell className="hidden sm:table-cell">
                                        <Image
                                            alt={category.name}
                                            className="aspect-square rounded-md object-cover"
                                            height="40"
                                            src={category.imageUrl}
                                            width="40"
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">{category.name}</TableCell>
                                    <TableCell>{category.slug}</TableCell>
                                    <TableCell>{category.order}</TableCell>
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
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </>
    );
}

    