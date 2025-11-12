

'use client';
import { use, useEffect, useState, useCallback } from 'react';
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
import { Counter } from '@/components/ui/counter';

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
  const slug = use(params).slug;
  const firestore = useFirestore();
  const { toast } = useToast();
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [price, setPrice] = useState<number | null>(null);

  const categoriesRef = useMemoFirebase(() => firestore ? collection(firestore, 'product_categories') : null, [firestore]);
  const { data: categories } = useCollection<any>(categoriesRef);

  const calculatePrice = useCallback(() => {
    if (!product || !product.pricing || !product.pricing.tiers) {
      return null;
    }

    const tier = product.pricing.tiers
      .slice()
      .sort((a: any, b: any) => b.minQty - a.minQty)
      .find((t: any) => quantity >= t.minQty);

    if (!tier) return null;

    let { unitCost = 0, setup = 0, margin = 0 } = tier;

    let optionsCost = 0;
    let numberInputMultiplier = 1;

    if (product.details) {
      for (const label in selectedOptions) {
        const selectedValue = selectedOptions[label];
        const detail = product.details.find((d: any) => d.label === label);

        if (detail) {
          if (detail.type === 'dropdown' && detail.values) {
            const option = detail.values.find((v: any) => v.value === selectedValue);
            if (option && option.cost) {
              optionsCost += option.cost;
            }
          } else if (detail.type === 'number') {
            const numericValue = parseFloat(selectedValue);
            if (!isNaN(numericValue) && numericValue > 0) {
              numberInputMultiplier *= numericValue;
            }
          }
        }
      }
    }
    
    // Apply multiplier to unit cost
    unitCost *= numberInputMultiplier;

    const totalCost = setup + quantity * (unitCost + optionsCost);

    const finalPrice = totalCost / (1 - margin / 100);

    return isNaN(finalPrice) ? null : Math.round(finalPrice);
  }, [product, quantity, selectedOptions]);

  useEffect(() => {
    async function fetchProduct() {
      setIsLoading(true);
      const productData = await getProductBySlug(firestore, slug);
      if (!productData) {
        notFound();
      } else {
        setProduct(productData);
        setSelectedImage(productData.mainImageIndex || 0);

        // Set default options
        const defaultOptions: Record<string, string> = {};
        if (productData.details) {
            productData.details.forEach((detail: any) => {
                if (detail.type === 'dropdown' && detail.values && detail.values.length > 0) {
                    defaultOptions[detail.label] = detail.values[0].value;
                }
                if (detail.type === 'number' && detail.placeholder) {
                    defaultOptions[detail.label] = detail.placeholder;
                } else if (detail.type === 'number') {
                    defaultOptions[detail.label] = '1';
                }
            });
        }
        setSelectedOptions(defaultOptions);
        setQuantity(productData.pricing?.tiers?.[0]?.minQty || 1);
      }
      setIsLoading(false);
    }

    if (firestore && slug) {
      fetchProduct();
    }
  }, [firestore, slug]);


  useEffect(() => {
    setPrice(calculatePrice());
  }, [product, quantity, selectedOptions, calculatePrice]);

  const handleOptionChange = (label: string, value: string) => {
    setSelectedOptions(prev => ({ ...prev, [label]: value }));
  };

  const renderDetailField = (detail: any) => {
    switch (detail.type) {
        case 'dropdown':
            return (
                <div key={detail.label} className="grid gap-2">
                    <Label htmlFor={`detail-${detail.label}`}>{detail.label}</Label>
                    <Select onValueChange={(value) => handleOptionChange(detail.label, value)} value={selectedOptions[detail.label] || ''}>
                        <SelectTrigger id={`detail-${detail.label}`}>
                            <SelectValue placeholder={`Select ${detail.label}`} />
                        </SelectTrigger>
                        <SelectContent>
                            {detail.values?.map((opt: any) => <SelectItem key={opt.value} value={opt.value}>{opt.value} {opt.cost > 0 && `(+₦${opt.cost.toLocaleString()})`}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            );
        case 'text':
             return (
                <div key={detail.label} className="grid gap-2">
                    <Label htmlFor={`detail-${detail.label}`}>{detail.label}</Label>
                    <Input 
                        id={`detail-${detail.label}`} 
                        type={detail.type} 
                        placeholder={detail.placeholder || ''}
                        value={selectedOptions[detail.label] || ''}
                        onChange={(e) => handleOptionChange(detail.label, e.target.value)}
                    />
                </div>
            )
        case 'number':
            return (
                 <div key={detail.label} className="grid gap-2">
                    <Label htmlFor={`detail-${detail.label}`}>{detail.label}</Label>
                    <Counter
                        value={parseInt(selectedOptions[detail.label], 10) || 1}
                        setValue={(value) => handleOptionChange(detail.label, value.toString())}
                    />
                </div>
            )
        default:
            return null;
    }
  };

  if (isLoading || !product) {
    return <div className="flex h-96 items-center justify-center"><LoaderCircle className="h-8 w-8 animate-spin" /></div>;
  }
  
  const category = categories?.find(c => c.id === product.categoryId);
  const mainImageUrl = product.imageUrls && product.imageUrls.length > 0
    ? product.imageUrls[selectedImage]
    : `https://picsum.photos/seed/${product.id}/600/600`;

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
                    onError={(e) => { e.currentTarget.srcset = `https://picsum.photos/seed/${product.id}/600/600`; }}
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
                            onError={(e) => { e.currentTarget.srcset = `https://picsum.photos/seed/${product.id}-${index}/100/100`; }}
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
                    {product.details?.map(renderDetailField)}
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
                        {price !== null ? (
                            <>
                                <p className="text-3xl font-bold">₦{price.toLocaleString()}</p>
                                <p className="text-sm text-muted-foreground">for {quantity} units</p>
                            </>
                        ) : (
                             <p className="text-lg font-semibold text-muted-foreground">Select options to see price</p>
                        )}

                    </div>
                    <Link href="#" className="text-sm font-medium text-primary hover:underline">
                        Bulk discounts available
                    </Link>
                </div>

                <Button size="lg" className="w-full h-12 text-lg font-semibold" disabled={price === null} onClick={() => toast({ title: "Feature coming soon!", description: "Add to cart functionality is not yet implemented."})}>
                    Add to Cart
                </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
