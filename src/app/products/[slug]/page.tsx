
'use client';
import { useEffect, useState, useCallback, use } from 'react';
import { notFound, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LoaderCircle, UploadCloud, Star, ShoppingCart } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, getDocs, limit, doc } from 'firebase/firestore';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Counter } from '@/components/ui/counter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import { useCart } from '@/context/cart-context';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

async function getProductBySlug(firestore: any, slug: string) {
    if (!firestore || !slug) return null;
    const productsRef = collection(firestore, 'products');
    const q = query(productsRef, where("slug", "==", slug), where("status", "==", "Published"), limit(1));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return null;
    }
    const productDoc = querySnapshot.docs[0];
    return { ...productDoc.data(), id: productDoc.id };
}

function FaqSection() {
    const firestore = useFirestore();
    const faqsRef = useMemoFirebase(() => firestore ? query(collection(firestore, 'faqs'), where('visible', '==', true)) : null, [firestore]);
    const { data: faqs, isLoading } = useCollection<any>(faqsRef);

    if (isLoading) {
        return <LoaderCircle className="animate-spin" />
    }

    if (!faqs || faqs.length === 0) {
        return <p className="text-muted-foreground">No frequently asked questions found.</p>
    }

    return (
        <Accordion type="single" collapsible className="w-full">
            {faqs.map(faq => (
                <AccordionItem value={faq.id} key={faq.id}>
                    <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                    <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    )
}

const ProductDetailSkeleton = () => (
    <div className="container mx-auto max-w-7xl px-4 py-8 md:py-16">
        <Skeleton className="h-4 w-1/3 mb-4" />
        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            <div className="space-y-4">
                <Skeleton className="aspect-square w-full rounded-lg" />
                <div className="grid grid-cols-5 gap-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="aspect-square rounded-md" />
                    ))}
                </div>
            </div>
            <div className="space-y-6">
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-5 w-1/4" />
                <div className="space-y-6 pt-6">
                    <Skeleton className="h-8 w-1/3 mb-4" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-10 w-1/2" />
                    </div>
                    <Skeleton className="h-12 w-full" />
                </div>
                <Separator />
                <div className="p-6 rounded-lg space-y-4 border">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-1/2" />
                        <Skeleton className="h-4 w-1/3" />
                    </div>
                    <Skeleton className="h-12 w-full" />
                </div>
            </div>
        </div>
    </div>
);

function ProductJsonLd({ product, price }: { product: any, price: number | null }) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "image": product.imageUrls?.[product.mainImageIndex || 0] || '',
        "description": product.description,
        "sku": product.id,
        "brand": {
            "@type": "Brand",
            "name": "BOMedia"
        },
        "offers": {
            "@type": "Offer",
            "url": `https://bomedia.com.ng/products/${product.slug}`,
            "priceCurrency": "NGN",
            "price": price ? price.toFixed(2) : "0",
            "availability": "https://schema.org/InStock"
        },
         "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "reviewCount": "1288"
        }
    };

    return (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    );
}

export default function ProductDetailPage({ params: paramsProp }: { params: { slug: string } }) {
  const params = use(paramsProp);
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = params.slug;
  const firestore = useFirestore();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [price, setPrice] = useState<number | null>(null);

  const categoriesRef = useMemoFirebase(() => firestore ? collection(firestore, 'product_categories') : null, [firestore]);
  const { data: categories } = useCollection<any>(categoriesRef);

  const getMinQuantity = useCallback(() => {
    if (!product || !product.pricing || !product.pricing.tiers || product.pricing.tiers.length === 0) {
      return 1;
    }
    const tiers = product.pricing.tiers.filter((t: any) => t.minQty > 0);
    if (tiers.length === 0) return 1;
    return tiers.reduce((min: number, tier: any) => Math.min(min, tier.minQty), Infinity);
  }, [product]);

  const getStepForQuantity = useCallback((currentQuantity: number) => {
    if (!product || !product.pricing || !product.pricing.tiers) {
        return 1;
    }
    const tier = product.pricing.tiers
        .slice()
        .sort((a: any, b: any) => b.minQty - a.minQty)
        .find((t: any) => currentQuantity >= t.minQty);

    return tier?.step || 1;
  }, [product]);


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

        const defaultOptions: Record<string, string> = {};
        if (productData.details) {
            productData.details.forEach((detail: any) => {
                if (detail.type === 'dropdown' && detail.values && detail.values.length > 0) {
                    defaultOptions[detail.label] = detail.values[0].value;
                }
                if (detail.type === 'number' && detail.placeholder) {
                    defaultOptions[detail.label] = detail.placeholder;
                } else if (detail.type === 'number') {
                  defaultOptions[detail.label] = (detail.min || 1).toString();
                }
            });
        }
        setSelectedOptions(defaultOptions);
        
        const minQty = productData.pricing?.tiers?.filter((t: any) => t.minQty > 0).reduce((min: number, tier: any) => Math.min(min, tier.minQty), Infinity) || 1;
        setQuantity(isFinite(minQty) ? minQty : 1);
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

  useEffect(() => {
    if (product?.name) {
      document.title = `${product.name} | BOMedia`;
    }
  }, [product?.name]);

  const handleOptionChange = (label: string, value: string) => {
    setSelectedOptions(prev => ({ ...prev, [label]: value }));
  };

  const handleGetQuote = () => {
    if (!product) return;
    router.push(`/quote?product=${encodeURIComponent(product.name)}`);
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
                        value={parseInt(selectedOptions[detail.label], 10) || detail.min || 1}
                        setValue={(value) => handleOptionChange(detail.label, value.toString())}
                        min={detail.min}
                        max={detail.max}
                    />
                </div>
            )
        default:
            return null;
    }
  };

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }
  
  if (!product) {
      return notFound();
  }
  
  const category = categories?.find(c => c.id === product.categoryId);
  const minQty = getMinQuantity();
  const allOptionsSelected = product.details ? product.details.every((d: any) => selectedOptions[d.label]) : true;

  const mainImageUrl = product.imageUrls?.[selectedImage] || `https://placehold.co/600x400/e2e8f0/e2e8f0`;


  return (
    <>
      <ProductJsonLd product={product} price={price} />
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
            <div className="space-y-4 md:sticky top-24 self-start">
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
                  {product.imageUrls?.map((url: string, index: number) => {
                      const thumbnailUrl = url || `https://placehold.co/100x100/e2e8f0/e2e8f0`;
                      return (
                          <button
                              key={index}
                              onClick={() => setSelectedImage(index)}
                              className={cn(
                                  "aspect-square relative rounded-md border overflow-hidden transition",
                                  selectedImage === index ? "ring-2 ring-primary ring-offset-2" : "hover:opacity-80"
                              )}
                          >
                              <Image
                                  src={thumbnailUrl}
                                  alt={`${product.name} thumbnail ${index + 1}`}
                                  fill
                                  className="object-cover"
                                  sizes="20vw"
                              />
                          </button>
                      )
                  })}
              </div>
            </div>

            {/* Product Details & Customization */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold font-heading">{product.name}</h1>
                <div className="mt-3 flex items-center gap-2">
                      <div className="flex items-center">
                          {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />)}
                      </div>
                      <span className="text-sm text-muted-foreground">4.8 (1,288 reviews)</span>
                  </div>
              </div>
              
              <div className="space-y-6">
                  <h2 className="text-2xl font-semibold">Customize Your Order</h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {product.details?.map(renderDetailField)}
                  </div>

                  <div className="grid gap-2">
                      <Label>Quantity</Label>
                      <Counter 
                          value={quantity} 
                          setValue={setQuantity} 
                          min={minQty}
                          step={getStepForQuantity(quantity)}
                      />
                  </div>
                  
                  <Button variant="outline" className="w-full h-12 text-base" onClick={handleGetQuote}>
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
                      <button onClick={() => {
                          const element = document.getElementById('details-tab');
                          element?.click();
                          element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }} className="text-sm font-medium text-primary hover:underline">
                          Bulk discounts available
                      </button>
                  </div>

                  <Button size="lg" className="w-full h-12 text-lg font-semibold" disabled={!allOptionsSelected} onClick={handleGetQuote}>
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Get a Quote
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                      We'll send a final proof for your approval before printing.
                  </p>
              </div>
            </div>
          </div>
          <div className="mt-16 grid grid-cols-1 lg:grid-cols-10 gap-8">
            <div className="lg:col-span-7">
              <Tabs defaultValue="description">
                  <TabsList>
                      <TabsTrigger value="description">Description</TabsTrigger>
                      <TabsTrigger id="details-tab" value="details">Product Details</TabsTrigger>
                      <TabsTrigger value="faq">FAQ</TabsTrigger>
                  </TabsList>
                  <TabsContent value="description" className="py-6 prose max-w-none">
                       <ReactMarkdown remarkPlugins={[remarkGfm]}>{product.description || 'No description provided.'}</ReactMarkdown>
                  </TabsContent>
                  <TabsContent value="details" className="py-6 prose max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{product.longDescription || 'No details provided.'}</ReactMarkdown>
                  </TabsContent>
                  <TabsContent value="faq" className="py-6">
                      <FaqSection />
                  </TabsContent>
              </Tabs>
            </div>
            <div className="lg:col-span-3">
                {/* This is the 35% placeholder column. Content will be added later. */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
