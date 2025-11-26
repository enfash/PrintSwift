
'use client';

import React, { useState, useMemo, Suspense, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
    Search,
    LoaderCircle
} from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useDebounce } from '@/hooks/use-debounce';
import { cn } from '@/lib/utils';

function calculateStartingPrice(product: any) {
    if (!product.pricing || !product.pricing.tiers || product.pricing.tiers.length === 0) {
        return null;
    }

    const startingTier = product.pricing.tiers
        .filter((t: any) => t.minQty > 0)
        .sort((a: any, b: any) => a.minQty - b.minQty)[0];
        
    if (!startingTier || typeof startingTier.minQty !== 'number' || typeof startingTier.unitCost !== 'number') {
        return null;
    }

    const { minQty, setup = 0, unitCost, margin = 0 } = startingTier;
    if (minQty === 0) return null; // Avoid division by zero

    const totalCost = setup + (minQty * unitCost);
    const finalPrice = totalCost / (1 - margin / 100);
    const pricePerUnit = finalPrice / minQty;
    return pricePerUnit;
}

const ProductCardSkeleton = () => (
    <Card className="overflow-hidden group h-full flex flex-col">
        <Skeleton className="aspect-square w-full" />
        <CardContent className="p-4 flex-grow flex flex-col">
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-2/3 mb-4" />
            <div className="flex-grow" />
            <Skeleton className="h-10 w-full mt-auto" />
        </CardContent>
    </Card>
);

const FilterSkeleton = () => (
    <div className="space-y-6">
        <div>
            <Skeleton className="h-6 w-20 mb-3" />
            <Skeleton className="h-10 w-full" />
        </div>
        <div>
            <Skeleton className="h-6 w-24 mb-3" />
            <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-2">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const TiltCard = ({ children, className }: { children: React.ReactNode, className?: string }) => {
    const cardRef = React.useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        const { left, top, width, height } = cardRef.current.getBoundingClientRect();
        const x = e.clientX - left - width / 2;
        const y = e.clientY - top - height / 2;
        
        const rotateX = (y / height) * -15; // Tilt intensity
        const rotateY = (x / width) * 15;

        cardRef.current.style.setProperty('--rotate-x', `${rotateX}deg`);
        cardRef.current.style.setProperty('--rotate-y', `${rotateY}deg`);
    };

    const handleMouseLeave = () => {
        if (cardRef.current) {
            cardRef.current.style.setProperty('--rotate-x', '0deg');
            cardRef.current.style.setProperty('--rotate-y', '0deg');
        }
    };

    return (
        <div 
            ref={cardRef} 
            className={cn('tilt-card', className)} 
            onMouseMove={handleMouseMove} 
            onMouseLeave={handleMouseLeave}
        >
            {children}
        </div>
    );
};


function ProductsComponent() {
    const firestore = useFirestore();
    const searchParams = useSearchParams();
    const router = useRouter();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [sortOption, setSortOption] = useState('popularity-desc');
    
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const categoriesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'product_categories') : null, [firestore]);
    const { data: categories, isLoading: isLoadingCategories } = useCollection<any>(categoriesQuery);

    const productsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'products'), where('status', '==', 'Published')) : null, [firestore]);
    const { data: allProducts, isLoading: isLoadingProducts } = useCollection<any>(productsQuery);

    useEffect(() => {
        const newCategory = searchParams.get('category');
        setSelectedCategories(newCategory ? newCategory.split(',') : []);
        const newSearch = searchParams.get('search');
        setSearchTerm(newSearch || '');
    }, [searchParams]);

    const updateURLParams = (newParams: Record<string, string | undefined>) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(newParams).forEach(([key, value]) => {
            if (value) {
                params.set(key, value);
            } else {
                params.delete(key);
            }
        });
        router.replace(`/products?${params.toString()}`, { scroll: false });
    };

    const handleCategoryChange = (categoryId: string, checked: boolean | string) => {
        const newSelectedCategories = checked
            ? [...selectedCategories, categoryId]
            : selectedCategories.filter(id => id !== categoryId);
        
        setSelectedCategories(newSelectedCategories);
        updateURLParams({ category: newSelectedCategories.join(',') || undefined, search: searchTerm || undefined });
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newSearchTerm = e.target.value;
        setSearchTerm(newSearchTerm);
        updateURLParams({ search: newSearchTerm || undefined, category: selectedCategories.join(',') || undefined });
    }

    const filteredAndSortedProducts = useMemo(() => {
        if (!allProducts) return [];

        let filtered = [...allProducts];

        // Filter by selected categories
        if (selectedCategories.length > 0) {
            filtered = filtered.filter(p => p.categoryId && selectedCategories.includes(p.categoryId));
        }

        // Filter by search term
        if (debouncedSearchTerm) {
            const lowercasedTerm = debouncedSearchTerm.toLowerCase();
            filtered = filtered.filter(p => 
                (p.searchTerms && p.searchTerms.some((st: string) => st.includes(lowercasedTerm))) ||
                p.name?.toLowerCase().includes(lowercasedTerm)
            );
        }

        // Sort the filtered products
        filtered.sort((a, b) => {
            const [key, order] = sortOption.split('-');
            if (key === 'price') {
                 const priceA = calculateStartingPrice(a) || (order === 'asc' ? Infinity : -Infinity);
                 const priceB = calculateStartingPrice(b) || (order === 'asc' ? Infinity : -Infinity);
                 return order === 'asc' ? priceA - priceB : priceB - priceA;
            }
            if (key === 'name') {
                return order === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
            }
            // Default to popularity (featured first)
            const featuredA = a.featured ? 1 : 0;
            const featuredB = b.featured ? 1 : 0;
            return featuredB - featuredA;
        });

        return filtered;
    }, [allProducts, selectedCategories, debouncedSearchTerm, sortOption]);

    const isLoading = isLoadingCategories || isLoadingProducts;
    
    const clearFilters = () => {
        setSearchTerm('');
        setSelectedCategories([]);
        router.replace('/products');
    };

    return (
        <div className="container mx-auto max-w-7xl px-4 py-16 md:py-24">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold font-heading">Our Products</h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                    Explore our extensive catalog of customizable products, designed to make your brand stand out.
                </p>
            </div>

            <div className="grid lg:grid-cols-4 gap-8">
                {/* Filters Sidebar */}
                <aside className="lg:col-span-1">
                    <Card className="sticky top-24">
                        <CardHeader>
                            <CardTitle>Filters</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {isLoading ? <FilterSkeleton /> : (
                                <>
                                    <div>
                                        <h3 className="font-semibold mb-3">Search</h3>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input 
                                                placeholder="Search products..."
                                                className="pl-9"
                                                value={searchTerm}
                                                onChange={handleSearchChange}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-3">Category</h3>
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
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </aside>

                {/* Products Grid */}
                <main className="lg:col-span-3">
                    <div className="flex justify-between items-center mb-6">
                        <p className="text-sm text-muted-foreground">
                            {isLoading ? 'Loading...' : `Showing ${filteredAndSortedProducts.length} products`}
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
                    
                    {isLoading ? (
                         <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                            {Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}
                         </div>
                    ) : filteredAndSortedProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                            {filteredAndSortedProducts.map((product) => {
                                const startingPrice = calculateStartingPrice(product);
                                const rawUrl = product.imageUrls && product.imageUrls.length > 0
                                    ? product.imageUrls[product.mainImageIndex || 0]
                                    : null;
                                const mainImageUrl = rawUrl || `https://placehold.co/600x400/e2e8f0/e2e8f0`;

                                return (
                                    <TiltCard key={product.id}>
                                        <Card className="overflow-hidden group transition-shadow duration-300 h-full flex flex-col">
                                            <Link href={`/products/${product.slug}`} className="block">
                                                <div className="overflow-hidden">
                                                    <div className="aspect-square relative">
                                                        <Image
                                                            src={mainImageUrl}
                                                            alt={product.name}
                                                            fill
                                                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                                                            sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
                                                        />
                                                    </div>
                                                </div>
                                            </Link>
                                            <CardContent className="p-4 flex-grow flex flex-col">
                                                <h3 className="font-semibold text-lg truncate">{product.name}</h3>
                                                {startingPrice !== null && !isNaN(startingPrice) ? (
                                                    <p className="font-bold text-lg text-primary">
                                                        Starts at ₦{Math.ceil(startingPrice).toLocaleString()}
                                                    </p>
                                                ) : (
                                                     <p className="text-sm text-muted-foreground h-6">
                                                        &nbsp;
                                                    </p>
                                                )}
                                                <div className="flex-grow" />
                                                <Button asChild className="mt-4 w-full">
                                                    <Link href={`/products/${product.slug}`}>View Product</Link>
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </TiltCard>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-24 bg-card rounded-lg border border-dashed">
                            <Search className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-medium">No Products Found</h3>
                            <p className="mt-1 text-sm text-muted-foreground">Try adjusting your filters to find what you're looking for.</p>
                            <Button variant="outline" className="mt-6" onClick={clearFilters}>
                                Clear Filters
                            </Button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}


export default function ProductsPage() {
    return (
        <Suspense fallback={<div className="flex h-screen w-full items-center justify-center"><LoaderCircle className="h-12 w-12 animate-spin" /></div>}>
            <ProductsComponent />
        </Suspense>
    )
}
