
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
    MousePointerSquareDashed,
    UploadCloud,
    Truck,
    ArrowRight,
    LoaderCircle,
    Star,
    Award,
    Clock,
    DollarSign,
    Users,
} from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

const categoryIcons: { [key: string]: React.ReactElement } = {
  'Marketing & Business Prints': <Briefcase className="w-8 h-8" />,
  'Corporate Gifts': <Gift className="w-8 h-8" />,
  'Large Format & Outdoor': <Printer className="w-8 h-8" />,
  'Packaging Prints': <Box className="w-8 h-8" />,
  'Apparel & Textile Printing': <Shirt className="w-8 h-8" />,
  'Signage & Display Systems': <MonitorPlay className="w-8 h-8" />,
  'Unbeatable Quality': <Award className="w-8 h-8" />,
  'Fast Turnaround': <Clock className="w-8 h-8" />,
  'Affordable Pricing': <DollarSign className="w-8 h-8" />,
  'Expert Support': <Users className="w-8 h-8" />,
  'Default': <Briefcase className="w-8 h-8" />
};

const howItWorksSteps = [
  {
    step: 1,
    title: 'Choose Your Product',
    description: 'Browse our extensive catalog and select the perfect item for your branding needs.',
    icon: <MousePointerSquareDashed className="w-10 h-10" />,
  },
  {
    step: 2,
    title: 'Upload Your Design',
    description: 'Easily upload your artwork, or use our tools to create a new design from scratch.',
    icon: <UploadCloud className="w-10 h-10" />,
  },
  {
    step: 3,
    title: 'Receive Your Order',
    description: 'We print, pack, and deliver your custom products right to your doorstep, fast.',
    icon: <Truck className="w-10 h-10" />,
  },
];

const whyChooseUsItems = [
    {
        title: 'Unbeatable Quality',
        description: 'We use state-of-the-art printing technology and premium materials to ensure every product meets the highest standards.',
        icon: 'Unbeatable Quality'
    },
    {
        title: 'Fast Turnaround',
        description: 'With our efficient processes, we offer some of the fastest production and delivery times in the industry, without compromising quality.',
        icon: 'Fast Turnaround'
    },
    {
        title: 'Affordable Pricing',
        description: 'Get top-quality custom printing at competitive prices. We offer solutions for every budget, from small businesses to large corporations.',
        icon: 'Affordable Pricing'
    },
    {
        title: 'Expert Support',
        description: 'Our dedicated team is here to help you every step of the way, from choosing the right product to finalizing your design.',
        icon: 'Expert Support'
    },
];

function findImage(id: string) {
  return PlaceHolderImages.find((img) => img.id === id);
}

function StarRating({ rating, className }: { rating: number, className?: string }) {
    return (
        <div className={cn("flex items-center", className)}>
            {[...Array(5)].map((_, i) => (
                <Star
                    key={i}
                    className={`h-5 w-5 ${i < rating ? 'text-accent fill-accent' : 'text-muted-foreground/30'}`}
                />
            ))}
        </div>
    );
}

const CategorySkeleton = () => (
    <Card className="text-center p-6 h-full">
        <div className="flex justify-center items-center mb-4">
            <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        <Skeleton className="h-4 w-2/3 mx-auto" />
    </Card>
);

const ProductSkeleton = () => (
    <Card className="overflow-hidden group h-full">
        <Skeleton className="aspect-[4/3] w-full" />
        <CardContent className="p-4">
            <Skeleton className="h-5 w-3/4 mb-2" />
        </CardContent>
    </Card>
);

const TestimonialSkeleton = () => (
    <Card className="flex flex-col text-center">
        <CardContent className="pt-6 flex-grow flex flex-col items-center">
            <Skeleton className="w-20 h-20 rounded-full mb-4" />
            <Skeleton className="h-5 w-24 mb-2" />
            <Skeleton className="h-4 w-32 mb-4" />
            <div className="flex space-x-1 mb-4">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-5 w-5" />
            </div>
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-5/6" />
        </CardContent>
    </Card>
)

export default function Home() {
  const heroImage = findImage('hero-printing');
  const firestore = useFirestore();

  const categoriesRef = useMemoFirebase(() => firestore ? collection(firestore, 'product_categories') : null, [firestore]);
  const { data: categories, isLoading: isLoadingCategories } = useCollection<any>(categoriesRef);

  const featuredProductsRef = useMemoFirebase(() => firestore ? query(collection(firestore, 'products'), where('featured', '==', true), where('status', '==', 'Published'), limit(12)) : null, [firestore]);
  const { data: featuredProducts, isLoading: isLoadingProducts } = useCollection<any>(featuredProductsRef);

  const testimonialsRef = useMemoFirebase(() => firestore ? query(collection(firestore, 'testimonials'), where('visible', '==', true), limit(3)) : null, [firestore]);
  const { data: testimonials, isLoading: isLoadingTestimonials } = useCollection<any>(testimonialsRef);

  return (
    <>
      {/* Hero Section */}
      <section className="relative w-full h-[60vh] md:h-[70vh] flex items-center justify-center text-center bg-primary">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            fill
            sizes="100vw"
            className="object-cover opacity-20"
            priority
            data-ai-hint={heroImage.imageHint}
          />
        )}
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-primary-foreground">
          <h1 className="text-4xl md:text-6xl font-extrabold font-headline tracking-tight">
            Affordable Custom Branding, Delivered Fast
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

      {/* Browse by Category */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-headline">Browse by Category</h2>
            <p className="mt-3 text-lg text-muted-foreground">Explore our wide range of custom printing solutions</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {isLoadingCategories ? (
                Array.from({ length: 6 }).map((_, i) => <CategorySkeleton key={i} />)
            ) : (
                categories?.slice(0, 6).map((category) => (
                    <Link href={`/products?category=${category.id}`} key={category.id} className="group">
                    <Card className="text-center p-6 hover:shadow-lg transition-shadow duration-300 hover:-translate-y-1 h-full">
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
      </section>

      {/* Featured Products */}
      <section className="py-16 md:py-24 bg-card">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-headline">Featured Products</h2>
            <p className="mt-3 text-lg text-muted-foreground">Our most popular custom printing solutions</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {isLoadingProducts ? (
                Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)
            ) : (
                featuredProducts?.map((product) => {
                    const rawUrl = product.imageUrls && product.imageUrls.length > 0
                        ? product.imageUrls[product.mainImageIndex || 0]
                        : null;
                    const mainImageUrl = rawUrl || `https://placehold.co/600x400/e2e8f0/e2e8f0`;

                    return (
                    <Link key={product.id} href={`/products/${product.slug}`}>
                        <Card className="overflow-hidden group transition-shadow duration-300 hover:shadow-xl h-full">
                        <div className="overflow-hidden">
                            <div className="aspect-[4/3] relative">
                                <Image
                                src={mainImageUrl}
                                alt={product.name}
                                fill
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                                data-ai-hint="product image"
                                />
                            </div>
                        </div>
                        <CardContent className="p-4">
                            <h3 className="font-semibold text-lg">{product.name}</h3>
                        </CardContent>
                        </Card>
                    </Link>
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

      {/* How It Works */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-headline">How It Works</h2>
            <p className="mt-3 text-lg text-muted-foreground">Three simple steps to get your custom branded products</p>
          </div>
          <div className="relative">
            <div className="hidden md:block absolute top-8 left-0 w-full h-0.5 bg-border -translate-y-1/2"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16">
              {howItWorksSteps.map((step) => (
                <div key={step.step} className="text-center relative bg-background p-4">
                  <div className="flex justify-center mb-4">
                    <div className="bg-primary text-primary-foreground rounded-full h-16 w-16 flex items-center justify-center z-10 relative">
                      {step.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold font-headline mb-2">
                    {step.step}. {step.title}
                  </h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 md:py-24 bg-card">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-headline">Why Choose Us?</h2>
            <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
              Your reliable partner for high-quality printing and branding solutions.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyChooseUsItems.map((item) => (
              <div key={item.title} className="text-center p-6">
                <div className="flex justify-center mb-4">
                    <div className="bg-primary/10 text-primary rounded-full h-16 w-16 flex items-center justify-center">
                        {categoryIcons[item.icon] || categoryIcons['Default']}
                    </div>
                </div>
                <h3 className="text-xl font-bold font-headline mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto max-w-7xl px-4">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold font-headline">What Our Clients Say</h2>
                <p className="mt-3 text-lg text-muted-foreground">We're trusted by businesses across Nigeria</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {isLoadingTestimonials ? (
                    Array.from({ length: 3 }).map((_, i) => <TestimonialSkeleton key={i} />)
                ) : (
                    testimonials?.map((testimonial) => (
                        <Card key={testimonial.id} className="flex flex-col text-center">
                            <CardContent className="pt-6 flex-grow flex flex-col items-center">
                                <Avatar className="w-20 h-20 mb-4">
                                    <AvatarImage src={testimonial.imageUrl || `https://picsum.photos/seed/${testimonial.id}/100`} alt={testimonial.name} />
                                    <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <h4 className="font-semibold text-lg">{testimonial.name}</h4>
                                <p className="text-sm text-muted-foreground mb-4">{testimonial.company}</p>
                                <StarRating rating={testimonial.rating} className="mb-4" />
                                <p className="text-muted-foreground italic">"{testimonial.quote}"</p>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
      </section>
    </>
  );
}
