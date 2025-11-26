
'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Briefcase,
    Gift,
    Printer,
    Box,
    Shirt,
    MonitorPlay,
    ArrowRight,
    LoaderCircle,
} from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import HowItWorks from '@/components/home/HowItWorks';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import TestimonialsCarousel from '@/components/home/TestimonialsCarousel';
import { cn } from '@/lib/utils';
import React from 'react';
import { FlipWords } from '@/components/ui/flip-words';


const categoryIcons: { [key: string]: React.ReactElement } = {
  'Marketing & Business Prints': <Briefcase className="w-8 h-8" />,
  'Corporate Gifts': <Gift className="w-8 h-8" />,
  'Large Format & Outdoor': <Printer className="w-8 h-8" />,
  'Packaging Prints': <Box className="w-8 h-8" />,
  'Apparel & Textile Printing': <Shirt className="w-8 h-8" />,
  'Signage & Display Systems': <MonitorPlay className="w-8 h-8" />,
  'Default': <Briefcase className="w-8 h-8" />
};

const words = [
  'Delivered Fast',
  'Printed to Perfection',
  'Ready When You Need It',
  'Built for Your Business',
  'Designed to Stand Out',
  'Crafted with Precision',
  'Made for Small Businesses',
  'Shipped Nationwide',
  'Engineered for Impact',
  'Quality You Can Trust',
];

const CategorySkeleton = () => (
    <div className="flex-shrink-0 w-36 sm:w-auto">
        <Card className="text-center p-6 h-full flex flex-col items-center justify-center">
            <Skeleton className="h-10 w-10 rounded-full mb-4" />
            <Skeleton className="h-4 w-20" />
        </Card>
    </div>
);

const ProductSkeleton = () => (
    <Card className="overflow-hidden group h-full">
        <Skeleton className="aspect-square w-full" />
        <CardContent className="p-4">
            <Skeleton className="h-5 w-3/4" />
        </CardContent>
    </Card>
);

const TiltCard = ({ children, className }: { children: React.ReactNode, className?: string }) => {
    const cardRef = React.useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        const { left, top, width, height } = cardRef.current.getBoundingClientRect();
        const x = e.clientX - left - width / 2;
        const y = e.clientY - top - height / 2;
        
        const rotateX = (y / height) * -20; // Tilt intensity
        const rotateY = (x / width) * 20;

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


export default function Home() {
  const firestore = useFirestore();

  const categoriesRef = useMemoFirebase(() => firestore ? collection(firestore, 'product_categories') : null, [firestore]);
  const { data: categories, isLoading: isLoadingCategories } = useCollection<any>(categoriesRef);

  const featuredProductsRef = useMemoFirebase(() => firestore ? query(collection(firestore, 'products'), where('featured', '==', true), where('status', '==', 'Published'), limit(12)) : null, [firestore]);
  const { data: featuredProducts, isLoading: isLoadingProducts } = useCollection<any>(featuredProductsRef);

  return (
    <>
      {/* Hero Section */}
      <section className="relative w-full h-[548px] flex items-center justify-center text-center bg-primary">
        <Image
            src="https://images.unsplash.com/photo-1693031630369-bd429a57f115?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxwcmludGluZyUyMHByZXNzfGVufDB8fHx8MTc2Mjg4MDAwM3ww&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Printing Press"
            fill
            sizes="100vw"
            className="object-cover opacity-20"
            data-ai-hint="printing press"
            priority
          />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-primary-foreground">
          <h1 className="text-4xl md:text-[62px] font-extrabold font-heading tracking-tight leading-tight">
            Affordable Custom Branding,{' '}
            <FlipWords
                words={words}
                interval={5000}
                letterDelay={0.04}
                wordDelay={0.22}
                className="text-accent"
            />
          </h1>
          <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto text-primary-foreground/80">
            Transform your business with premium custom printing solutions. From branded packaging to corporate gifts,
            we bring your vision to life.
          </p>
          <div className="mt-8 flex justify-center gap-4 flex-wrap">
            <Button asChild size="lg" variant="secondary" className="font-semibold">
              <Link href="/products">Shop All Products</Link>
            </Button>
            <Button asChild size="lg" className="font-semibold bg-accent text-accent-foreground hover:bg-accent/90">
              <Link href="/quote">Get a Quote</Link>
            </Button>
          </div>
        </div>
      </section>

      <HowItWorks />

      {/* Browse by Category */}
      <section className="py-8 bg-background">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-heading">
              Discover our exclusive <br/>printing categories
            </h2>
          </div>
          <div className={cn("overflow-x-auto pb-2 -mx-4 px-4 md:overflow-visible", "no-scrollbar")}>
            <div className="flex flex-row md:grid md:grid-cols-3 lg:grid-cols-6 gap-6 w-max md:w-auto">
                {isLoadingCategories ? (
                    Array.from({ length: 6 }).map((_, i) => <CategorySkeleton key={i} />)
                ) : (
                    categories?.slice(0, 6).map((category) => (
                        <Link href={`/products?category=${category.id}`} key={category.id} className="group flex-shrink-0 w-36 sm:w-auto">
                        <Card className="text-center p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full">
                            <div className="flex justify-center items-center mb-4 text-primary group-hover:text-accent transition-colors">
                            {categoryIcons[category.name] || categoryIcons['Default']}
                            </div>
                            <h3 className="font-semibold">{category.name}</h3>
                        </Card>
                        </Link>
                    ))
                )}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-8 bg-card">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-heading">Featured Products</h2>
            <p className="mt-3 text-lg text-muted-foreground">Our most popular custom printing solutions</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {isLoadingProducts ? (
                Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)
            ) : (
                featuredProducts?.map((product) => {
                    const rawUrl = product.imageUrls && product.imageUrls.length > 0
                        ? product.imageUrls[product.mainImageIndex || 0]
                        : null;
                    const mainImageUrl = rawUrl || `https://placehold.co/600x400/e2e8f0/e2e8f0`;

                    return (
                    <TiltCard key={product.id}>
                        <Link href={`/products/${product.slug}`}>
                            <Card className="overflow-hidden group transition-shadow duration-300 h-full border-none shadow-none hover:shadow-xl">
                            <div className="overflow-hidden">
                                <div className="aspect-square relative">
                                    <Image
                                    src={mainImageUrl}
                                    alt={product.name}
                                    fill
                                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                                    data-ai-hint="product image"
                                    />
                                </div>
                            </div>
                            <CardContent className="p-4 text-center">
                                <h3 className="font-semibold text-lg">{product.name}</h3>
                            </CardContent>
                            </Card>
                        </Link>
                    </TiltCard>
                    );
                })
            )}
            </div>
          <div className="text-center mt-12">
            <Button asChild size="lg" variant="outline">
              <Link href="/products">
                View All Products <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <WhyChooseUs />
      <TestimonialsCarousel />
    </>
  );
}
