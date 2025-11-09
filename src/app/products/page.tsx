
'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
    Search,
    Package,
    LoaderCircle
} from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy as firestoreOrderBy } from 'firebase/firestore';

export default function ProductsPage() {
    const firestore = useFirestore();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [sortOption, setSortOption] = useState('popularity-desc');

    const categoriesQuery = useMemoFirebase(() => collection(firestore, 'product_categories'), [firestore]);
    const { data: categories, isLoading: isLoadingCategories } = useCollection<any>(categoriesQuery);

    const productsQuery = useMemoFirebase(() => collection(firestore, 'products'), [firestore]);
    const { data: allProducts, isLoading: isLoadingProducts } = useCollection<any>(productsQuery);

    const handleCategoryChange = (categoryId: string, checked: boolean | string) => {
        if (checked) {
            setSelectedCategories(prev => [...prev, categoryId]);
        } else {
            setSelectedCategories(prev => prev.filter(id => id !== categoryId));
        }
    };

    const filteredAndSortedProducts = useMemo(() => {
        if (!allProducts) return [];
        let products = allProducts;

        // Filter by search term
        if (searchTerm) {
            products = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        // Filter by categories
        if (selectedCategories.length > 0) {
            products = products.filter(p => selectedCategories.includes(p.categoryId));
        }

        // Sort products
        products.sort((a, b) => {
            const [key, order] = sortOption.split('-');
            const valA = a[key as keyof typeof a];
            const valB = b[key as keyof typeof b];

            if (key === 'price' || key === 'popularity') {
                 const numA = Number(valA) || 0;
                 const numB = Number(valB) || 0;
                 return order === 'asc' ? numA - numB : numB - numA;
            }

            if (typeof valA === 'string' && typeof valB === 'string') {
                return order === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
            }
            
            return 0;
        });

        return products;
    }, [searchTerm, selectedCategories, sortOption, allProducts]);

    const isLoading = isLoadingCategories || isLoadingProducts;

    return (
        <div className="container mx-auto max-w-7xl px-4 py-16 md:py-24">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold font-headline">Our Products</h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                    Explore our extensive catalog of customizable products, designed to make your brand stand out.
                </p>
            </div>

            <div className="grid lg:grid-cols-4 gap-8">
                {/* Filters Sidebar */}
                <aside className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>Filters</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <h3 className="font-semibold mb-3">Search</h3>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        placeholder="Search products..."
                                        className="pl-9"
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-3">Category</h3>
                                {isLoadingCategories ? <p>Loading categories...</p> : (
                                    <div className="space-y-3">
                                        {categories?.map(category => (
                                            <div key={category.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={category.id}
                                                    onCheckedChange={(checked) => handleCategoryChange(category.id, checked)}
                                                    checked={selectedCategories.includes(category.id)}
                                                />
                                                <Label htmlFor={category.id} className="font-normal cursor-pointer">{category.name}</Label>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </aside>

                {/* Products Grid */}
                <main className="lg:col-span-3">
                    <div className="flex justify-between items-center mb-6">
                        <p className="text-sm text-muted-foreground">
                            {isLoading ? 'Loading...' : `Showing ${filteredAndSortedProducts.length} of ${allProducts?.length || 0} products`}
                        </p>
                        <div className="flex items-center gap-2">
                            <Label htmlFor="sort-by" className="text-sm">Sort by:</Label>
                            <Select value={sortOption} onValueChange={setSortOption}>
                                <SelectTrigger id="sort-by" className="w-[180px]">
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="popularity-desc">Popularity</SelectItem>
                                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                                    <SelectItem value="name-asc">Name: A to Z</SelectItem>
                                    <SelectItem value="name-desc">Name: Z to A</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    
                    {isLoadingProducts ? (
                         <div className="flex h-64 items-center justify-center"><LoaderCircle className="h-8 w-8 animate-spin" /></div>
                    ) : filteredAndSortedProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredAndSortedProducts.map((product) => (
                                    <Link key={product.id} href={`/products/${product.id}`} className="block">
                                        <Card className="overflow-hidden group transition-shadow duration-300 hover:shadow-xl h-full flex flex-col">
                                            <div className="overflow-hidden">
                                                <div className="aspect-[4/3] relative">
                                                    {product.imageUrl ? (
                                                        <Image
                                                            src={product.imageUrl}
                                                            alt={product.name}
                                                            fill
                                                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                                                            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-muted flex items-center justify-center">
                                                            <Package className="w-12 h-12 text-muted-foreground" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <CardContent className="p-4 flex-grow flex flex-col">
                                                <h3 className="font-semibold text-lg truncate">{product.name}</h3>
                                                <p className="text-sm text-muted-foreground flex-grow">{product.categoryName}</p>
                                                <p className="font-bold text-lg mt-2">₦{product.price?.toLocaleString() || 'N/A'}</p>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                        </div>
                    ) : (
                        <div className="text-center py-24 bg-card rounded-lg border border-dashed">
                            <Search className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-medium">No Products Found</h3>
                            <p className="mt-1 text-sm text-muted-foreground">Try adjusting your filters to find what you're looking for.</p>
                            <Button variant="outline" className="mt-6" onClick={() => { setSearchTerm(''); setSelectedCategories([]); }}>
                                Clear Filters
                            </Button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
