import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Package,
  Gift,
  Megaphone,
  NotebookText,
  Shirt,
  Presentation,
  MousePointerSquareDashed,
  UploadCloud,
  Truck,
  ArrowRight,
} from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const categories = [
  { name: 'Branded Packaging', icon: <Package className="w-8 h-8" />, href: '/products' },
  { name: 'Corporate Gifts', icon: <Gift className="w-8 h-8" />, href: '/products' },
  { name: 'Marketing Materials', icon: <Megaphone className="w-8 h-8" />, href: '/products' },
  { name: 'Business Stationery', icon: <NotebookText className="w-8 h-8" />, href: '/products' },
  { name: 'Custom Apparel', icon: <Shirt className="w-8 h-8" />, href: '/products' },
  { name: 'Signage & Banners', icon: <Presentation className="w-8 h-8" />, href: '/products' },
];

const featuredProducts = [
  { id: 'prod_1', name: 'Custom Mugs', imageId: 'custom-mug' },
  { id: 'prod_2', name: 'Branded Boxes', imageId: 'branded-box' },
  { id: 'prod_3', name: 'Premium Business Cards', imageId: 'business-card' },
  { id: 'prod_4', name: 'Eco-Friendly Tote Bags', imageId: 'tote-bag' },
];

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

function findImage(id: string) {
  return PlaceHolderImages.find((img) => img.id === id);
}

export default function Home() {
  const heroImage = findImage('hero-printing');

  return (
    <>
      {/* Hero Section */}
      <section className="relative w-full h-[60vh] md:h-[70vh] flex items-center justify-center text-center">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            fill
            className="object-cover"
            priority
            data-ai-hint={heroImage.imageHint}
          />
        )}
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-white">
          <h1 className="text-4xl md:text-6xl font-extrabold font-headline tracking-tight">
            Affordable Custom Branding, Delivered Fast
          </h1>
          <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto text-primary-foreground/80">
            Transform your business with premium custom printing solutions. From branded packaging to corporate gifts,
            we bring your vision to life.
          </p>
          <div className="mt-8 flex justify-center gap-4 flex-wrap">
            <Button asChild size="lg" className="font-semibold bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/products">Shop All Products</Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="font-semibold">
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
            {categories.map((category) => (
              <Link href={category.href} key={category.name} className="group">
                <Card className="text-center p-6 hover:shadow-lg transition-shadow duration-300 hover:-translate-y-1">
                  <div className="flex justify-center items-center mb-4 text-primary group-hover:text-accent transition-colors">
                    {category.icon}
                  </div>
                  <h3 className="font-semibold">{category.name}</h3>
                </Card>
              </Link>
            ))}
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
            {featuredProducts.map((product) => {
              const image = findImage(product.imageId);
              return (
                <Card key={product.id} className="overflow-hidden group transition-shadow duration-300 hover:shadow-xl">
                  <div className="overflow-hidden">
                    <div className="aspect-[4/3] relative">
                      {image && (
                        <Image
                          src={image.imageUrl}
                          alt={product.name}
                          fill
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                          data-ai-hint={image.imageHint}
                        />
                      )}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                  </CardContent>
                </Card>
              );
            })}
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
    </>
  );
}
