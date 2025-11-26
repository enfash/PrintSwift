
'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle, LoaderCircle, Trash2 } from 'lucide-react';
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
import { collection, doc, writeBatch } from 'firebase/firestore';
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
import { useMemo, useState } from 'react';
import { getSafeImageUrl } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';


export default function CategoriesPage() {
    const firestore = useFirestore();
    const { toast } = useToast();
    
    const categoriesRef = useMemoFirebase(() => firestore ? collection(firestore, 'product_categories') : null, [firestore]);
    const { data: categories, isLoading: isLoadingCategories } = useCollection<any>(categoriesRef);

    const productsRef = useMemoFirebase(() => firestore ? collection(firestore, 'products') : null, [firestore]);
    const { data: products, isLoading: isLoadingProducts } = useCollection<any>(productsRef);

    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    const productCounts = useMemo(() => {
        if (!products) return {};
        return products.reduce((acc, product) => {
            if (product.categoryId) {
                acc[product.categoryId] = (acc[product.categoryId] || 0) + 1;
            }
            return acc;
        }, {} as { [key: string]: number });
    }, [products]);
    
    const filteredCategories = useMemo(() => {
        if (!categories) return [];
        return categories.filter(category => 
            category.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [categories, searchTerm]);

    const handleDelete = (categoryId: string) => {
        if (!firestore) return;
        const categoryDocRef = doc(firestore, 'product_categories', categoryId);
        deleteDocumentNonBlocking(categoryDocRef);
        toast({
            title: 'Category Deleted',
            description: 'The category has been successfully deleted.',
        });
        setSelectedCategories(prev => prev.filter(id => id !== categoryId));
    };

    const handleMultiDelete = async () => {
        if (!firestore || selectedCategories.length === 0) return;
        const batch = writeBatch(firestore);
        selectedCategories.forEach(categoryId => {
            const categoryDocRef = doc(firestore, 'product_categories', categoryId);
            batch.delete(categoryDocRef);
        });
        await batch.commit();
        toast({
            title: 'Categories Deleted',
            description: `${selectedCategories.length} categories have been successfully deleted.`,
        });
        setSelectedCategories([]);
    };
    
    const handleSelectAll = (checked: boolean | string) => {
        if (checked) {
            setSelectedCategories(filteredCategories.map(c => c.id));
        } else {
            setSelectedCategories([]);
        }
    };
    
    const handleSelectCategory = (categoryId: string, checked: boolean | string) => {
        if (checked) {
            setSelectedCategories(prev => [...prev, categoryId]);
        } else {
            setSelectedCategories(prev => prev.filter(id => id !== categoryId));
        }
    };
    
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
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>All Categories</CardTitle>
                            <CardDescription>
                                {isLoading ? 'Loading categories...' : `You have ${categories?.length || 0} categories.`}
                            </CardDescription>
                        </div>
                         {selectedCategories.length > 0 && (
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete ({selectedCategories.length})
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will permanently delete {selectedCategories.length} category/ies.
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
                    <div className="mb-4">
                        <Input 
                            placeholder="Search categories..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-sm"
                        />
                    </div>
                   <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[40px]">
                                    <Checkbox
                                        onCheckedChange={handleSelectAll}
                                        checked={selectedCategories.length === filteredCategories.length && filteredCategories.length > 0}
                                        aria-label="Select all"
                                    />
                                </TableHead>
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
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            <LoaderCircle className="mx-auto h-8 w-8 animate-spin" />
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : filteredCategories && filteredCategories.length > 0 ? filteredCategories.map(category => (
                                <TableRow key={category.id} data-state={selectedCategories.includes(category.id) ? "selected" : ""}>
                                     <TableCell>
                                        <Checkbox
                                            checked={selectedCategories.includes(category.id)}
                                            onCheckedChange={(checked) => handleSelectCategory(category.id, checked)}
                                            aria-label={`Select ${category.name}`}
                                        />
                                    </TableCell>
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
                                    <TableCell>{productCounts[category.id] || 0}</TableCell>
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
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        No categories found matching your search.
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
