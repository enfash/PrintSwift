
'use client';
import { use, useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LoaderCircle, UploadCloud, Minus, Plus, Star } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

async function getProductBySlug(firestore: any, slug: string) {
    if (!firestore || !slug) return null;
    const productsRef = collection(firestore, 'products');
    const q = query(productsRef, where("slug", "==", slug), limit(1));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return null;
    }
    const productDoc = querySnapshot.docs[0];
    return { ...productDoc.data(), id: productDoc.id };
}

function QuantityControl({ value, onChange }: { value: number, onChange: (value: number) => void }) {
    const increment = () => onChange(value + 1);
    const decrement = () => onChange(Math.max(1, value - 1));

    return (
        <div className="flex items-center">
            <Button variant="outline" size="icon" className="h-10 w-10" onClick={decrement}>
                <Minus className="h-4 w-4" />
            </Button>
            <Input
                type="number"
                className="w-20 h-10 text-center mx-2"
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value, 10) || 1)}
            />
            <Button variant="outline" size="icon" className="h-10 w-10" onClick={increment}>
                <Plus className="h-4 w-4" />
            </Button>
        </div>
    )
}


export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = use(params);
  const firestore = useFirestore();
  const { toast } = useToast();
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(500);

  const categoriesRef = useMemoFirebase(() => firestore ? collection(firestore, 'product_categories') : null, [firestore]);
  const { data: categories } = useCollection<any>(categoriesRef);

  useEffect(() => {
    async function fetchProduct() {
      setIsLoading(true);
      const productData = await getProductBySlug(firestore, slug);
      if (!productData) {
        notFound();
      } else {
        setProduct(productData);
        setSelectedImage(productData.mainImageIndex || 0);
      }
      setIsLoading(false);
    }

    if (firestore && slug) {
      fetchProduct();
    }
  }, [firestore, slug]);


  if (isLoading || !product) {
    return <div className="flex h-96 items-center justify-center"><LoaderCircle className="h-8 w-8 animate-spin" /></div>;
  }
  
  const category = categories?.find(c => c.id === product.categoryId);
  const mainImageUrl = product.imageUrls && product.imageUrls.length > 0
    ? product.imageUrls[selectedImage]
    : 'https://placehold.co/600x400';

  return (
    <div className="bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-8 md:py-16">
        {category && (
            <div className="text-sm text-muted-foreground mb-4">
                <Link href="/" className="hover:text-primary">Home</Link>
                <span className="mx-2">/</span>
                <Link href={`/products?category=${category.id}`} className="hover:text-primary">{category.name}</Link>
                <span className="mx-2">/</span>
                <span className="text-foreground">{product.name}</span>
            </div>
        )}
        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          {/* Product Image Gallery */}
          <div className="space-y-4 sticky top-24 self-start">
            <div className="aspect-square relative rounded-lg border overflow-hidden">
                <Image
                src={mainImageUrl}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
                />
            </div>
             <div className="grid grid-cols-5 gap-2">
                {product.imageUrls.map((url: string, index: number) => (
                    <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={cn(
                            "aspect-square relative rounded-md border overflow-hidden transition",
                            selectedImage === index ? "ring-2 ring-primary ring-offset-2" : "hover:opacity-80"
                        )}
                    >
                         <Image
                            src={url}
                            alt={`${product.name} thumbnail ${index + 1}`}
                            fill
                            className="object-cover"
                            sizes="20vw"
                        />
                    </button>
                ))}
            </div>
          </div>

          {/* Product Details & Customization */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-headline">{product.name}</h1>
              <p className="mt-2 text-lg text-muted-foreground">
                {product.description}
              </p>
               <div className="mt-3 flex items-center gap-2">
                    <div className="flex items-center">
                        {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />)}
                    </div>
                    <span className="text-sm text-muted-foreground">4.8 (1,288 reviews)</span>
                </div>
            </div>

            <Separator />
            
            <div className="space-y-6">
                <h2 className="text-2xl font-semibold">Customize Your Order</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {product.details?.map((detail: any) => (
                         <div key={detail.label} className="grid gap-2">
                            <Label htmlFor={`detail-${detail.label}`}>{detail.label}</Label>
                            <Select>
                                <SelectTrigger id={`detail-${detail.label}`}>
                                    <SelectValue placeholder={`Select ${detail.label}`} />
                                </SelectTrigger>
                                <SelectContent>
                                    {detail.values.map((opt: any) => <SelectItem key={opt.value} value={opt.value}>{opt.value}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    ))}
                    <div className="grid gap-2">
                        <Label htmlFor="width">Width (in)</Label>
                        <Input id="width" placeholder="3.5" />
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="height">Height (in)</Label>
                        <Input id="height" placeholder="2.0" />
                    </div>
                </div>

                 <div className="grid gap-2">
                    <Label>Quantity</Label>
                    <QuantityControl value={quantity} onChange={setQuantity} />
                </div>
                
                <Button variant="outline" className="w-full h-12 text-base" onClick={() => toast({ title: "Feature coming soon!", description: "Artwork upload will be implemented in a future step."})}>
                    <UploadCloud className="mr-2 h-5 w-5" />
                    Upload Your Artwork
                </Button>
            </div>
            
            <Separator />

            <div className="bg-muted/50 p-6 rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-3xl font-bold">$78.50</p>
                        <p className="text-sm text-muted-foreground">for {quantity} cards</p>
                    </div>
                    <Link href="#" className="text-sm font-medium text-primary hover:underline">
                        Bulk discounts available
                    </Link>
                </div>

                <Button size="lg" className="w-full h-12 text-lg font-semibold" onClick={() => toast({ title: "Feature coming soon!", description: "Add to cart functionality is not yet implemented."})}>
                    Add to Cart
                </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

    