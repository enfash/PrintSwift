
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
import { MoreHorizontal, PlusCircle, LoaderCircle } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCollection, useFirestore, useMemoFirebase, deleteDocumentNonBlocking, useUser } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
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
} from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast';
import { useState, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDistanceToNow } from 'date-fns';

const ProductsList = () => {
    const firestore = useFirestore();
    const { toast } = useToast();
    const productsRef = useMemoFirebase(() => firestore ? collection(firestore, 'products') : null, [firestore]);
    const categoriesRef = useMemoFirebase(() => firestore ? collection(firestore, 'product_categories') : null, [firestore]);
    
    const { data: products, isLoading: isLoadingProducts, error: productsError } = useCollection<any>(productsRef);
    const { data: categories, isLoading: isLoadingCategories, error: categoriesError } = useCollection<any>(categoriesRef);

    const [filterStatus, setFilterStatus] = useState('all');
    const [filterCategory, setFilterCategory] = useState('all');
    const [sortOption, setSortOption] = useState('updatedAt-desc');

    const getCategoryName = (categoryId: string) => {
        return categories?.find(c => c.id === categoryId)?.name || 'N/A';
    };
    
    const handleDelete = (productId: string) => {
        if (!firestore) return;
        const productDocRef = doc(firestore, 'products', productId);
        deleteDocumentNonBlocking(productDocRef);
        toast({
            title: 'Product Deleted',
            description: 'The product has been successfully deleted.',
        });
    }

    const filteredAndSortedProducts = useMemo(() => {
        if (!products) return [];
        let filtered = [...products];

        // Filter by status
        if (filterStatus !== 'all') {
            filtered = filtered.filter(p => (p.status || 'Draft') === filterStatus);
        }

        // Filter by category
        if (filterCategory !== 'all') {
            filtered = filtered.filter(p => p.categoryId === filterCategory);
        }

        // Sort products
        filtered.sort((a, b) => {
            const [key, order] = sortOption.split('-');
            
            if (!a[key] || !b[key]) return 0;
            
            let comparison = 0;
            if (key === 'updatedAt' || key === 'createdAt') {
                const dateA = a[key]?.toDate() || 0;
                const dateB = b[key]?.toDate() || 0;
                comparison = dateA - dateB;
            } else if (typeof a[key] === 'string') {
                comparison = a[key].localeCompare(b[key]);
            } else {
                comparison = a[key] - b[key];
            }
            
            return order === 'desc' ? -comparison : comparison;
        });

        return filtered;
    }, [products, filterStatus, filterCategory, sortOption]);

    const isLoading = isLoadingProducts || isLoadingCategories;
    const error = productsError || categoriesError;

    if (error) {
        return <p>Error: {error.message}</p>;
    }
    
    const isValidUrl = (url: string) => {
        try {
            new URL(url);
            return true;
        } catch (_) {
            return false;
        }
    }

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
                    <div className="flex items-center gap-2 mb-4 p-4 bg-muted/50 rounded-lg">
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="Published">Published</SelectItem>
                                <SelectItem value="Draft">Draft</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={filterCategory} onValueChange={setFilterCategory}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {categories?.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <div className="flex-grow" />
                        <Select value={sortOption} onValueChange={setSortOption}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="updatedAt-desc">Last Modified</SelectItem>
                                <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                                <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                                <SelectItem value="status-asc">Status</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="hidden w-[100px] sm:table-cell">
                                    <span className="sr-only">Image</span>
                                </TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Last Modified</TableHead>
                                <TableHead>
                                    <span className="sr-only">Actions</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        <LoaderCircle className="mx-auto h-8 w-8 animate-spin" />
                                    </TableCell>
                                </TableRow>
                            ) : filteredAndSortedProducts && filteredAndSortedProducts.length > 0 ? filteredAndSortedProducts.map(product => {
                                const rawUrl = product.imageUrls && product.imageUrls.length > 0 
                                    ? product.imageUrls[product.mainImageIndex || 0] 
                                    : 'https://placehold.co/40x40';

                                const mainImageUrl = isValidUrl(rawUrl) ? rawUrl : 'https://placehold.co/40x40';

                                return (
                                <TableRow key={product.id}>
                                    <TableCell className="hidden sm:table-cell">
                                        <Image
                                            alt={product.name}
                                            className="aspect-square rounded-md object-cover"
                                            height="40"
                                            src={mainImageUrl}
                                            width="40"
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">{product.name}</TableCell>
                                    <TableCell>{getCategoryName(product.categoryId)}</TableCell>
                                    <TableCell>
                                        <Badge variant={product.status === 'Published' ? 'default' : 'secondary'}>
                                            {product.status || 'Draft'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-xs">
                                        {product.updatedAt ? `${formatDistanceToNow(product.updatedAt.toDate())} ago` : 'N/A'}
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
                                                        <Link href={`/admin/products/${product.id}`}>Edit</Link>
                                                    </DropdownMenuItem>
                                                    <AlertDialogTrigger asChild>
                                                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                                                    </AlertDialogTrigger>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete the product
                                                        and remove its data from our servers.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(product.id)} className="bg-destructive hover:bg-destructive/90">
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                                );
                            }) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        No products found. Try adjusting your filters.
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

export default function ProductsPage() {
    const { user, isUserLoading, userError } = useUser();

    if (isUserLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <LoaderCircle className="h-8 w-8 animate-spin" />
                <p className="ml-2">Loading user authentication...</p>
            </div>
        );
    }

    if (userError) {
        return <p>Error: {userError.message}</p>;
    }

    if (!user) {
        return <p>Please log in to view products.</p>;
    }

    return <ProductsList />;
}
