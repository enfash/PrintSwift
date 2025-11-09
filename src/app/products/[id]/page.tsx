
'use client';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Award, Package, Clock, Users, LoaderCircle, DollarSign } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

function calculateCustomerPrice(tier: any) {
    const { qty, setup = 0, unitCost = 0, margin = 0 } = tier;
    if (!qty || !unitCost) return { total: 0, perUnit: 0 };

    const totalCost = setup + (qty * unitCost);
    const finalPrice = totalCost / (1 - margin / 100);
    return {
        total: Math.round(finalPrice),
        perUnit: Math.round(finalPrice / qty),
    };
};

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const firestore = useFirestore();
  
  const productRef = useMemoFirebase(() => firestore ? doc(firestore, 'products', id) : null, [firestore, id]);
  const { data: product, isLoading, error } = useDoc<any>(productRef);

  if (isLoading) {
    return <div className="flex h-96 items-center justify-center"><LoaderCircle className="h-8 w-8 animate-spin" /></div>;
  }

  if (!product || error) {
    notFound();
  }
  
  const hasPricingTiers = product.pricing?.tiers && product.pricing.tiers.length > 0;

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
                {product.description}
              </p>
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
            
            {hasPricingTiers && (
                <div className="space-y-4">
                    <h3 className="text-xl font-bold font-headline flex items-center"><DollarSign className="mr-3 h-6 w-6 text-accent" /> Pricing Tiers</h3>
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead className="text-right">Price per Unit</TableHead>
                                        <TableHead className="text-right">Total Price</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {product.pricing.tiers.map((tier: any, index: number) => {
                                        const price = calculateCustomerPrice(tier);
                                        return (
                                            <TableRow key={index}>
                                                <TableCell className="font-medium">{tier.qty.toLocaleString()}</TableCell>
                                                <TableCell className="text-right">₦{price.perUnit.toLocaleString()}</TableCell>
                                                <TableCell className="text-right">₦{price.total.toLocaleString()}</TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                     <p className="text-sm text-muted-foreground">Prices are exclusive of 7.5% VAT. Request a quote for custom quantities or options.</p>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
