
'use client';
import { notFound, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, FileCheck, Award, Package, Clock, Users, ArrowRight, LoaderCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const firestore = useFirestore();
  
  const productRef = doc(firestore, 'products', params.id);
  const { data: product, isLoading, error } = useDoc<any>(productRef);

  if (isLoading) {
    return <div className="flex h-96 items-center justify-center"><LoaderCircle className="h-8 w-8 animate-spin" /></div>;
  }

  if (!product || error) {
    notFound();
  }

  // For now, we only have details for business cards.
  // We can show a generic page for others, or a "details coming soon" message.
  if (!product.details) {
    return (
        <div className="container mx-auto max-w-5xl px-4 py-16 md:py-24">
            <div className="text-center">
                <h1 className="text-4xl font-bold font-headline">{product.name}</h1>
                <p className="mt-4 text-lg text-muted-foreground">
                    Detailed information for this product is coming soon.
                </p>
                 <Button asChild className="mt-8">
                    <Link href={`/quote?product=${product.name}`}>Request a Quote</Link>
                </Button>
            </div>
        </div>
    )
  }

  return (
    <div className="bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-12 md:py-20">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          {/* Product Image */}
          <div>
            <Card className="overflow-hidden sticky top-24">
              <div className="aspect-[4/3] relative">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <Package className="w-24 h-24 text-muted-foreground" />
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Product Details */}
          <div className="space-y-8">
            <div>
              <Badge variant="secondary" className="mb-2">{product.categoryName}</Badge>
              <h1 className="text-3xl md:text-4xl font-bold font-headline">{product.name}</h1>
              <p className="mt-3 text-lg text-muted-foreground">
                {product.details.shortDescription}
              </p>
              <p className="text-3xl font-bold mt-4">{product.details.priceRange}</p>
              <p className="text-sm text-muted-foreground">Varies by quantity, material, and finishing.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild>
                    <Link href={`/quote?product=${product.name}`}>Request a Quote</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                    <Link href="/contact">Ask a Question</Link>
                </Button>
            </div>

            <Separator />
            
            {/* Key Features */}
            {product.details.keyFeatures && (
            <div className="space-y-4">
                <h3 className="text-xl font-bold font-headline flex items-center"><Award className="mr-3 h-6 w-6 text-accent" /> Key Features</h3>
                <ul className="space-y-2 pl-4">
                    {product.details.keyFeatures.map((feature: string) => (
                        <li key={feature} className="flex items-start">
                            <Check className="h-5 w-5 mr-3 mt-1 text-accent shrink-0"/>
                            <span className="text-muted-foreground">{feature}</span>
                        </li>
                    ))}
                </ul>
            </div>
            )}

            <Separator />

            {/* Specifications */}
            <div className="grid sm:grid-cols-2 gap-8">
                {product.details.availableSizes && <div className="space-y-4">
                    <h4 className="font-semibold text-lg">Available Sizes</h4>
                    <ul className="text-muted-foreground list-disc list-inside space-y-1">
                        {product.details.availableSizes.map((size: string) => <li key={size}>{size}</li>)}
                    </ul>
                </div>}
                {product.details.materialOptions && <div className="space-y-4">
                    <h4 className="font-semibold text-lg">Material Options</h4>
                    <ul className="text-muted-foreground list-disc list-inside space-y-1">
                        {product.details.materialOptions.map((material: string) => <li key={material}>{material}</li>)}
                    </ul>
                </div>}
                {product.details.printOptions && <div className="space-y-4">
                    <h4 className="font-semibold text-lg">Print Options</h4>
                    <ul className="text-muted-foreground list-disc list-inside space-y-1">
                        {product.details.printOptions.map((option: string) => <li key={option}>{option}</li>)}
                    </ul>
                </div>}
                {product.details.finishingOptions && <div className="space-y-4">
                    <h4 className="font-semibold text-lg">Finishing Options</h4>
                    <ul className="text-muted-foreground list-disc list-inside space-y-1">
                        {product.details.finishingOptions.map((finish: string) => <li key={finish}>{finish}</li>)}
                    </ul>
                </div>}
            </div>

            <Separator />

            {/* Other Details */}
            <div className="grid sm:grid-cols-2 gap-6 text-sm">
                {product.details.moq && <div className="flex items-start space-x-3">
                    <Package className="h-5 w-5 mt-0.5 text-accent shrink-0" />
                    <div>
                        <h5 className="font-semibold">Minimum Order</h5>
                        <p className="text-muted-foreground">{product.details.moq}</p>
                    </div>
                </div>}
                {product.details.leadTime && <div className="flex items-start space-x-3">
                    <Clock className="h-5 w-5 mt-0.5 text-accent shrink-0" />
                    <div>
                        <h5 className="font-semibold">Lead Time</h5>
                        <p className="text-muted-foreground">{product.details.leadTime.join(' / ')}</p>
                    </div>
                </div>}
                 {product.details.bestFor && <div className="flex items-start space-x-3">
                    <Users className="h-5 w-5 mt-0.5 text-accent shrink-0" />
                    <div>
                        <h5 className="font-semibold">Best For</h5>
                        <p className="text-muted-foreground">{product.details.bestFor.join(', ')}</p>
                    </div>
                </div>}
                {product.details.artworkRequirements && <div className="flex items-start space-x-3">
                    <FileCheck className="h-5 w-5 mt-0.5 text-accent shrink-0" />
                    <div>
                        <h5 className="font-semibold">Artwork Requirements</h5>
                        <ul className="text-muted-foreground space-y-0.5">
                            {product.details.artworkRequirements.map((req: string) => <li key={req}>{req}</li>)}
                        </ul>
                    </div>
                </div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  // This part is tricky without direct DB access at build time.
  // For now, we return an empty array and rely on fallback: 'blocking'
  // or on-demand generation. In a real app, you might pre-build popular products.
  return [];
}
