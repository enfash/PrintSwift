
'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
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
    <div className="flex-shrink-0 w-full">
        <Card className="text-center p-5 h-full flex flex-col items-center justify-center shadow-sm">
            <Skeleton className="h-24 w-full mb-4" />
            <Skeleton className="h-6 w-3/4 mt-2" />
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


function CategoryCard({ title, href = '#', imageUrl, accent = '#FFD27A' }: { title: string, href?: string, imageUrl: string, accent?: string }) {
  return (
    <a
      href={href}
      className="group block bg-white rounded-2xl border-transparent shadow-sm hover:shadow-md transition-transform transform hover:-translate-y-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary h-full flex flex-col"
      aria-label={title}
    >
      <div className="relative pt-4 px-4 pb-2 flex-grow flex flex-col">
        <div
          aria-hidden="true"
          style={{ background: accent }}
          className="absolute left-4 right-4 top-4 bottom-14 rounded-lg z-0"
        />
        <div className="relative z-10 flex items-center justify-center h-[140px]">
          <Image
            src={imageUrl}
            alt=""
            width={140}
            height={140}
            className="object-contain drop-shadow-[0_12px_24px_rgba(16,24,40,0.12)]"
          />
        </div>
      </div>
      <div className="px-4 pb-4 text-center">
        <div className="text-sm md:text-base font-semibold text-slate-900 leading-tight">
          {title}
        </div>
      </div>
    </a>
  );
}


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
      <section className="py-8 bg-background overflow-hidden">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-heading">
              Discover our exclusive <br/>printing categories
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {isLoadingCategories ? (
                    Array.from({ length: 4 }).map((_, i) => <CategorySkeleton key={i} />)
                ) : (
                    categories?.slice(0, 8).map((category, index) => (
                        <div key={category.id} className="w-full">
                            <CategoryCard
                            title={category.name}
                            href={`/products?category=${category.id}`}
                            imageUrl={category.iconUrl || `https://picsum.photos/seed/${category.id || index}/140/140`}
                            accent={category.backgroundColor || '#E2E8F0'}
                            />
                        </div>
                    ))
                )}
            </div>
          </div>
        </section>

      {/* Featured Products */}
      <section className="py-8 bg-muted/50">
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
                    const mainImageUrl = rawUrl || `https://picsum.photos/seed/${product.id}/600/400`;

                    return (
                    <TiltCard key={product.id}>
                        <Link href={`/products/${product.slug}`}>
                            <Card className="overflow-hidden group transition-shadow duration-300 h-full shadow-sm hover:shadow-xl">
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
