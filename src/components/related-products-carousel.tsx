
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit, documentId } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Skeleton } from '@/components/ui/skeleton';
import { getSafeImageUrl } from '@/lib/utils';

const ProductCardSkeleton = () => (
    <Card className="overflow-hidden group h-full">
        <Skeleton className="aspect-square w-full" />
        <CardContent className="p-4">
            <Skeleton className="h-5 w-3/4 mb-2" />
        </CardContent>
    </Card>
);

const RelatedProductsCarousel = ({ currentProduct }: { currentProduct: any }) => {
    const firestore = useFirestore();

    // Determine which IDs to fetch
    const relatedIds = currentProduct?.relatedProductIds?.length > 0
        ? currentProduct.relatedProductIds
        : [];

    // Query for related products if IDs are specified
    const relatedProductsQuery = useMemoFirebase(() => {
        if (firestore && relatedIds.length > 0) {
            // Corrected query using documentId()
            return query(collection(firestore, 'products'), where(documentId(), 'in', relatedIds));
        }
        return null;
    }, [firestore, relatedIds]);

    // Query for category products if no related IDs are specified
    const categoryProductsQuery = useMemoFirebase(() => {
        if (firestore && relatedIds.length === 0 && currentProduct?.categoryId) {
            return query(
                collection(firestore, 'products'),
                where('categoryId', '==', currentProduct.categoryId),
                where('status', '==', 'Published'),
                limit(10)
            );
        }
        return null;
    }, [firestore, relatedIds.length, currentProduct?.categoryId]);

    const { data: relatedProducts, isLoading: isLoadingRelated } = useCollection<any>(relatedProductsQuery);
    const { data: categoryProducts, isLoading: isLoadingCategory } = useCollection<any>(categoryProductsQuery);
    
    const isLoading = isLoadingRelated || isLoadingCategory;

    let productsToShow = relatedIds.length > 0 ? relatedProducts : categoryProducts;
    productsToShow = productsToShow?.filter(p => p.id !== currentProduct.id) || [];

    if (isLoading) {
        return (
            <div className="mt-16">
                <h2 className="text-2xl font-bold font-heading mb-6">You Might Also Like</h2>
                <Carousel opts={{ align: 'start', loop: true }}>
                    <CarouselContent>
                        {Array.from({ length: 4 }).map((_, index) => (
                            <CarouselItem key={index} className="basis-1/2 md:basis-1/3 lg:basis-1/4">
                                <ProductCardSkeleton />
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>
            </div>
        );
    }
    
    if (!productsToShow || productsToShow.length === 0) {
        return null; // Don't render anything if there are no related products
    }

    return (
        <div className="mt-16">
            <h2 className="text-2xl font-bold font-heading mb-6">You Might Also Like</h2>
            <Carousel opts={{ align: 'start', loop: productsToShow.length > 4 }}>
                <CarouselContent>
                    {productsToShow.map((product) => {
                        const imageUrl = getSafeImageUrl(product.imageUrls?.[product.mainImageIndex || 0]);
                        return (
                            <CarouselItem key={product.id} className="basis-1/2 md:basis-1/3 lg:basis-1/4">
                                <Link href={`/products/${product.slug}`}>
                                    <Card className="overflow-hidden group transition-shadow duration-300 shadow-none hover:shadow-xl h-full border-none">
                                        <div className="aspect-square relative overflow-hidden">
                                            <Image
                                                src={imageUrl}
                                                alt={product.name}
                                                fill
                                                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                                                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                                            />
                                        </div>
                                        <CardContent className="p-4">
                                            <h3 className="font-semibold text-base truncate">{product.name}</h3>
                                        </CardContent>
                                    </Card>
                                </Link>
                            </CarouselItem>
                        )
                    })}
                </CarouselContent>
                <CarouselPrevious className="hidden sm:flex" />
                <CarouselNext className="hidden sm:flex" />
            </Carousel>
        </div>
    );
};

export default RelatedProductsCarousel;
