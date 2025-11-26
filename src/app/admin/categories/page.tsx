
'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle, LoaderCircle, Package } from 'lucide-react';
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
import { useCollection, useFirestore, useMemoFirebase, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
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
import { useMemo } from 'react';
import { getSafeImageUrl } from '@/lib/utils';


export default function CategoriesPage() {
    const firestore = useFirestore();
    const { toast } = useToast();
    
    const categoriesRef = useMemoFirebase(() => firestore ? collection(firestore, 'product_categories') : null, [firestore]);
    const { data: categories, isLoading: isLoadingCategories } = useCollection<any>(categoriesRef);

    const productsRef = useMemoFirebase(() => firestore ? collection(firestore, 'products') : null, [firestore]);
    const { data: products, isLoading: isLoadingProducts } = useCollection<any>(productsRef);

    const productCounts = useMemo(() => {
        if (!products) return {};
        return products.reduce((acc, product) => {
            if (product.categoryId) {
                acc[product.categoryId] = (acc[product.categoryId] || 0) + 1;
            }
            return acc;
        }, {} as { [key: string]: number });
    }, [products]);

    const handleDelete = (categoryId: string) => {
        if (!firestore) return;
        const categoryDocRef = doc(firestore, 'product_categories', categoryId);
        deleteDocumentNonBlocking(categoryDocRef);
        toast({
            title: 'Category Deleted',
            description: 'The category has been successfully deleted.',
        });
    }
    
    const isLoading = isLoadingCategories || isLoadingProducts;

    return (
        <>
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Product Categories</h1>
                <Button asChild>
                    <Link href="/admin/categories/new">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add New Category
                    </Link>
                </Button>
            </div>
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>All Categories</CardTitle>
                    <CardDescription>
                        {isLoading ? 'Loading categories...' : `You have a total of ${categories?.length || 0} categories.`}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                   <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="hidden w-[64px] sm:table-cell">Icon</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Slug</TableHead>
                                <TableHead>Products</TableHead>
                                <TableHead>
                                    <span className="sr-only">Actions</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            <LoaderCircle className="mx-auto h-8 w-8 animate-spin" />
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : categories && categories.length > 0 ? categories.map(category => (
                                <TableRow key={category.id}>
                                     <TableCell className="hidden sm:table-cell">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-muted">
                                            <Image
                                                alt={category.name}
                                                className="aspect-square object-contain"
                                                height="32"
                                                src={getSafeImageUrl(category.iconUrl, category.id)}
                                                width="32"
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">{category.name}</TableCell>
                                    <TableCell>{category.id}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Package className="h-4 w-4"/>
                                            <span>{productCounts[category.id] || 0}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
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
                                                        <Link href={`/admin/categories/${category.id}`}>Edit</Link>
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
                                                        This action cannot be undone. This will permanently delete the category.
                                                        Products in this category will not be deleted but will need to be reassigned.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(category.id)} className="bg-destructive hover:bg-destructive/90">
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
                                        No categories found. Add one to get started.
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
