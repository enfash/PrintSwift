
'use client';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, FileCheck, Award, Package, Clock, Users, LoaderCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const firestore = useFirestore();
  
  const productRef = useMemoFirebase(() => firestore ? doc(firestore, 'products', params.id) : null, [firestore, params.id]);
  const { data: product, isLoading, error } = useDoc<any>(productRef);

  if (isLoading) {
    return <div className="flex h-96 items-center justify-center"><LoaderCircle className="h-8 w-8 animate-spin" /></div>;
  }

  if (!product || error) {
    notFound();
  }

  // Use product data directly from Firestore
  const productDetails = product;

  // A generic page for products without detailed descriptions.
  if (!productDetails.shortDescription) {
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
              {product.categoryName && <Badge variant="secondary" className="mb-2">{product.categoryName}</Badge>}
              <h1 className="text-3xl md:text-4xl font-bold font-headline">{product.name}</h1>
              <p className="mt-3 text-lg text-muted-foreground">
                {productDetails.shortDescription}
              </p>
              {productDetails.priceRange && <p className="text-3xl font-bold mt-4">{productDetails.priceRange}</p>}
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
            {productDetails.keyFeatures && (
            <div className="space-y-4">
                <h3 className="text-xl font-bold font-headline flex items-center"><Award className="mr-3 h-6 w-6 text-accent" /> Key Features</h3>
                <ul className="space-y-2 pl-4">
                    {productDetails.keyFeatures.map((feature: string) => (
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
                {productDetails.availableSizes && <div className="space-y-4">
                    <h4 className="font-semibold text-lg">Available Sizes</h4>
                    <ul className="text-muted-foreground list-disc list-inside space-y-1">
                        {productDetails.availableSizes.map((size: string) => <li key={size}>{size}</li>)}
                    </ul>
                </div>}
                {productDetails.materialOptions && <div className="space-y-4">
                    <h4 className="font-semibold text-lg">Material Options</h4>
                    <ul className="text-muted-foreground list-disc list-inside space-y-1">
                        {productDetails.materialOptions.map((material: string) => <li key={material}>{material}</li>)}
                    </ul>
                </div>}
                {productDetails.printOptions && <div className="space-y-4">
                    <h4 className="font-semibold text-lg">Print Options</h4>
                    <ul className="text-muted-foreground list-disc list-inside space-y-1">
                        {productDetails.printOptions.map((option: string) => <li key={option}>{option}</li>)}
                    </ul>
                </div>}
                {productDetails.finishingOptions && <div className="space-y-4">
                    <h4 className="font-semibold text-lg">Finishing Options</h4>
                    <ul className="text-muted-foreground list-disc list-inside space-y-1">
                        {productDetails.finishingOptions.map((finish: string) => <li key={finish}>{finish}</li>)}
                    </ul>
                </div>}
            </div>

            <Separator />

            {/* Other Details */}
            <div className="grid sm:grid-cols-2 gap-6 text-sm">
                {productDetails.moq && <div className="flex items-start space-x-3">
                    <Package className="h-5 w-5 mt-0.5 text-accent shrink-0" />
                    <div>
                        <h5 className="font-semibold">Minimum Order</h5>
                        <p className="text-muted-foreground">{productDetails.moq}</p>
                    </div>
                </div>}
                {productDetails.leadTime && <div className="flex items-start space-x-3">
                    <Clock className="h-5 w-5 mt-0.5 text-accent shrink-0" />
                    <div>
                        <h5 className="font-semibold">Lead Time</h5>
                        <p className="text-muted-foreground">{Array.isArray(productDetails.leadTime) ? productDetails.leadTime.join(' / ') : productDetails.leadTime}</p>
                    </div>
                </div>}
                 {productDetails.bestFor && <div className="flex items-start space-x-3">
                    <Users className="h-5 w-5 mt-0.5 text-accent shrink-0" />
                    <div>
                        <h5 className="font-semibold">Best For</h5>
                        <p className="text-muted-foreground">{Array.isArray(productDetails.bestFor) ? productDetails.bestFor.join(', ') : productDetails.bestFor}</p>
                    </div>
                </div>}
                {productDetails.artworkRequirements && <div className="flex items-start space-x-3">
                    <FileCheck className="h-5 w-5 mt-0.5 text-accent shrink-0" />
                    <div>
                        <h5 className="font-semibold">Artwork Requirements</h5>
                        <ul className="text-muted-foreground space-y-0.5">
                            {Array.isArray(productDetails.artworkRequirements) ? productDetails.artworkRequirements.map((req: string) => <li key={req}>{req}</li>) : <li>{productDetails.artworkRequirements}</li>}
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
