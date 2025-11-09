
'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
    Briefcase,
    Printer,
    Layers,
    Box,
    Shirt,
    Gift,
    MonitorPlay,
    Palette,
    PartyPopper,
    Search,
    Package
} from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export const allProducts = [
    // 1. Marketing & Business Prints
    { id: 'prod_busi_1', name: 'Business Cards', category: 'Marketing & Business Prints', price: 15000, popularity: 98 },
    { id: 'prod_busi_2', name: 'Brochures / Flyers', category: 'Marketing & Business Prints', price: 25000, popularity: 95 },
    { id: 'prod_busi_3', name: 'Posters (A3-A0)', category: 'Marketing & Business Prints', price: 5000, popularity: 88 },
    { id: 'prod_busi_4', name: 'Presentation Folders', category: 'Marketing & Business Prints', price: 35000, popularity: 82 },
    { id: 'prod_busi_5', name: 'Letterheads', category: 'Marketing & Business Prints', price: 20000, popularity: 90 },
    { id: 'prod_busi_6', name: 'Compliment Slips', category: 'Marketing & Business Prints', price: 18000, popularity: 75 },
    { id: 'prod_busi_7', name: 'Envelopes (Branded)', category: 'Marketing & Business Prints', price: 22000, popularity: 78 },
    { id: 'prod_busi_8', name: 'Notepads', category: 'Marketing & Business Prints', price: 12000, popularity: 85 },
    { id: 'prod_busi_9', name: 'NCR/Receipt Books', category: 'Marketing & Business Prints', price: 30000, popularity: 81 },
    { id: 'prod_busi_10', name: 'Invoices & Delivery Note Pads', category: 'Marketing & Business Prints', price: 30000, popularity: 80 },
    { id: 'prod_busi_11', name: 'Shelf Talkers', category: 'Marketing & Business Prints', price: 8000, popularity: 70 },
    { id: 'prod_busi_12', name: 'Loyalty Cards', category: 'Marketing & Business Prints', price: 16000, popularity: 83 },
    { id: 'prod_busi_13', name: 'Gift Vouchers', category: 'Marketing & Business Prints', price: 17000, popularity: 84 },


    // 2. Large Format & Outdoor Prints
    { id: 'prod_large_1', name: 'Roll-Up Banners', category: 'Large Format & Outdoor Prints', price: 45000, popularity: 92 },
    { id: 'prod_large_2', name: 'X-Stand Banners', category: 'Large Format & Outdoor Prints', price: 35000, popularity: 85 },
    { id: 'prod_large_3', name: 'PVC Flex Banners', category: 'Large Format & Outdoor Prints', price: 15000, popularity: 88 },
    { id: 'prod_large_4', name: 'Backdrop Banners', category: 'Large Format & Outdoor Prints', price: 65000, popularity: 89 },
    { id: 'prod_large_5', name: 'Wall Murals', category: 'Large Format & Outdoor Prints', price: 25000, popularity: 78 },
    { id: 'prod_large_6', name: 'Large Posters', category: 'Large Format & Outdoor Prints', price: 7000, popularity: 81 },
    { id: 'prod_large_7', name: 'Window Graphics', category: 'Large Format & Outdoor Prints', price: 18000, popularity: 83 },
    { id: 'prod_large_8', name: 'One-Way Vision Stickers', category: 'Large Format & Outdoor Prints', price: 20000, popularity: 86 },
    { id: 'prod_large_9', name: 'Backlit Sign Prints', category: 'Large Format & Outdoor Prints', price: 55000, popularity: 79 },
    { id: 'prod_large_10', name: 'Event Stage Backdrops', category: 'Large Format & Outdoor Prints', price: 75000, popularity: 87 },
    { id: 'prod_large_11', name: 'Danglers', category: 'Large Format & Outdoor Prints', price: 5000, popularity: 72 },
    { id: 'prod_large_12', name: 'Outdoor Boards (Alupanel / Corex)', category: 'Large Format & Outdoor Prints', price: 40000, popularity: 76 },


    // 3. Stickers & Labels
    { id: 'prod_stick_1', name: 'Paper Stickers', category: 'Stickers & Labels', price: 10000, popularity: 93 },
    { id: 'prod_stick_2', name: 'Vinyl Stickers', category: 'Stickers & Labels', price: 18000, popularity: 91 },
    { id: 'prod_stick_3', name: 'Waterproof Stickers', category: 'Stickers & Labels', price: 22000, popularity: 94 },
    { id: 'prod_stick_4', name: 'Transparent Stickers', category: 'Stickers & Labels', price: 20000, popularity: 89 },
    { id: 'prod_stick_5', name: 'Die-Cut Stickers', category: 'Stickers & Labels', price: 19000, popularity: 92 },
    { id: 'prod_stick_6', name: 'Roll Labels', category: 'Stickers & Labels', price: 25000, popularity: 88 },
    { id: 'prod_stick_7', name: 'Product Labels', category: 'Stickers & Labels', price: 12000, popularity: 90 },
    { id: 'prod_stick_8', name: 'Bottle Labels', category: 'Stickers & Labels', price: 15000, popularity: 87 },
    { id: 'prod_stick_9', name: 'Food Packaging Labels', category: 'Stickers & Labels', price: 13000, popularity: 86 },
    { id: 'prod_stick_10', name: 'Clothing Labels (Satin, Woven, Heat Transfer)', category: 'Stickers & Labels', price: 35000, popularity: 84 },


    // 4. Packaging Prints
    { id: 'prod_pack_1', name: 'Branded Nylon Bags', category: 'Packaging Prints', price: 500, popularity: 88 },
    { id: 'prod_pack_2', name: 'Paper Bags', category: 'Packaging Prints', price: 300, popularity: 90 },
    { id: 'prod_pack_3', name: 'Food Packaging Boxes', category: 'Packaging Prints', price: 250, popularity: 84 },
    { id: 'prod_pack_4', name: 'Greaseproof Paper', category: 'Packaging Prints', price: 8000, popularity: 81 },
    { id: 'prod_pack_5', name: 'Cup Sleeves', category: 'Packaging Prints', price: 100, popularity: 79 },
    { id: 'prod_pack_6', name: 'French Fry Boxes', category: 'Packaging Prints', price: 150, popularity: 78 },
    { id: 'prod_pack_7', name: 'Ice Cream Cups', category: 'Packaging Prints', price: 120, popularity: 77 },
    { id: 'prod_pack_8', name: 'Salad Bowls', category: 'Packaging Prints', price: 300, popularity: 76 },
    { id: 'prod_pack_9', name: 'Paper Trays', category: 'Packaging Prints', price: 90, popularity: 75 },
    { id: 'prod_pack_10', name: 'Product Boxes', category: 'Packaging Prints', price: 450, popularity: 86 },
    { id: 'prod_pack_11', name: 'Hang Tags', category: 'Packaging Prints', price: 50, popularity: 80 },
    { id: 'prod_pack_12', name: 'Insert Cards', category: 'Packaging Prints', price: 60, popularity: 74 },
    { id: 'prod_pack_13', name: 'Rigid Box Sleeves', category: 'Packaging Prints', price: 600, popularity: 82 },

    // 5. Apparel & Textile Printing
    { id: 'prod_app_1', name: 'T-Shirts', category: 'Apparel & Textile Printing', price: 8500, popularity: 94 },
    { id: 'prod_app_2', name: 'Hoodies & Sweatshirts', category: 'Apparel & Textile Printing', price: 15000, popularity: 89 },
    { id: 'prod_app_3', name: 'Polo Shirts', category: 'Apparel & Textile Printing', price: 10000, popularity: 85 },
    { id: 'prod_app_4', name: 'Caps / Hats', category: 'Apparel & Textile Printing', price: 5000, popularity: 90 },
    { id: 'prod_app_5', name: 'Tote Bags', category: 'Apparel & Textile Printing', price: 3500, popularity: 91 },
    { id: 'prod_app_6', name: 'Aprons', category: 'Apparel & Textile Printing', price: 6000, popularity: 82 },
    { id: 'prod_app_7', name: 'Safety Vests', category: 'Apparel & Textile Printing', price: 4000, popularity: 78 },
    { id: 'prod_app_8', name: 'Workwear Branding', category: 'Apparel & Textile Printing', price: 7000, popularity: 83 },

    // 6. Promotional Items (Corporate Gifts)
    { id: 'prod_promo_1', name: 'Pens', category: 'Promotional Items', price: 500, popularity: 88 },
    { id: 'prod_promo_2', name: 'Branded Notebooks', category: 'Promotional Items', price: 3500, popularity: 92 },
    { id: 'prod_promo_3', name: 'Mugs (Sublimation)', category: 'Promotional Items', price: 4500, popularity: 95 },
    { id: 'prod_promo_4', name: 'Water Bottles', category: 'Promotional Items', price: 5500, popularity: 89 },
    { id: 'prod_promo_5', name: 'Keyholders', category: 'Promotional Items', price: 1500, popularity: 87 },
    { id: 'prod_promo_6', name: 'Wristbands', category: 'Promotional Items', price: 300, popularity: 84 },
    { id: 'prod_promo_7', name: 'Umbrellas', category: 'Promotional Items', price: 12000, popularity: 86 },
    { id: 'prod_promo_8', name: 'Mousepads', category: 'Promotional Items', price: 2500, popularity: 81 },
    { id: 'prod_promo_9', name: 'Lanyards', category: 'Promotional Items', price: 1000, popularity: 85 },
    { id: 'prod_promo_10', name: 'ID Cards + Holders', category: 'Promotional Items', price: 2500, popularity: 80 },
    { id: 'prod_promo_11', name: 'Calendars (Desk, Wall)', category: 'Promotional Items', price: 4000, popularity: 90 },

    // 7. Signage & Display Systems
    { id: 'prod_sign_1', name: 'A-Frames / Signboards', category: 'Signage & Display Systems', price: 30000, popularity: 75 },
    { id: 'prod_sign_2', name: 'Light Boxes', category: 'Signage & Display Systems', price: 80000, popularity: 82 },
    { id: 'prod_sign_3', name: 'Acrylic Signs', category: 'Signage & Display Systems', price: 25000, popularity: 85 },
    { id: 'prod_sign_4', name: 'Directional Signs', category: 'Signage & Display Systems', price: 15000, popularity: 79 },
    { id: 'prod_sign_5', name: 'Menu Boards', category: 'Signage & Display Systems', price: 20000, popularity: 83 },
    { id: 'prod_sign_6', name: 'Office Door/Room Signs', category: 'Signage & Display Systems', price: 8000, popularity: 81 },
    { id: 'prod_sign_7', name: 'Tabletop Displays', category: 'Signage & Display Systems', price: 12000, popularity: 78 },
    { id: 'prod_sign_8', name: 'Event Display Systems', category: 'Signage & Display Systems', price: 150000, popularity: 84 },

    // 8. Digital Services
    { id: 'prod_dig_1', name: 'Brand Identity Design', category: 'Digital Services', price: 150000, popularity: 90 },
    { id: 'prod_dig_2', name: 'Logo Design', category: 'Digital Services', price: 50000, popularity: 94 },
    { id: 'prod_dig_3', name: 'Social Media Design', category: 'Digital Services', price: 75000, popularity: 88 },
    { id: 'prod_dig_4', name: 'Product Mockups', category: 'Digital Services', price: 25000, popularity: 85 },
    { id: 'prod_dig_5', name: 'Digital Catalogues', category: 'Digital Services', price: 60000, popularity: 83 },
    { id: 'prod_dig_6', name: 'Print-Ready Artwork Setup', category: 'Digital Services', price: 15000, popularity: 89 },
    { id: 'prod_dig_7', name: 'Photo Retouching', category: 'Digital Services', price: 10000, popularity: 80 },
    { id: 'prod_dig_8', name: 'Packaging Design', category: 'Digital Services', price: 90000, popularity: 87 },


    // 9. Event & Personal Prints
    { id: 'prod_event_1', name: 'Invitation Cards', category: 'Event & Personal Prints', price: 800, popularity: 88 },
    { id: 'prod_event_2', name: 'Wedding Programmes', category: 'Event & Personal Prints', price: 1000, popularity: 86 },
    { id: 'prod_event_3', name: 'Jotters', category: 'Event & Personal Prints', price: 1200, popularity: 85 },
    { id: 'prod_event_4', name: 'Souvenir Bags', category: 'Event & Personal Prints', price: 1500, popularity: 84 },
    { id: 'prod_event_5', name: 'Photo Books', category: 'Event & Personal Prints', price: 25000, popularity: 89 },
    { id: 'prod_event_6', name: 'Event Badges', category: 'Event & Personal Prints', price: 2000, popularity: 82 },
    { id: 'prod_event_7', name: 'Custom Stickers for Celebrations', category: 'Event & Personal Prints', price: 8000, popularity: 87 },
    { id: 'prod_event_8', name: 'Gift Tags', category: 'Event & Personal Prints', price: 4000, popularity: 81 },
    { id: 'prod_event_9', name: 'Custom Party Backdrops', category: 'Event & Personal Prints', price: 35000, popularity: 83 },
];

const categories = [
  { name: 'Marketing & Business Prints', icon: Briefcase },
  { name: 'Large Format & Outdoor Prints', icon: Printer },
  { name: 'Stickers & Labels', icon: Layers },
  { name: 'Packaging Prints', icon: Box },
  { name: 'Apparel & Textile Printing', icon: Shirt },
  { name: 'Promotional Items', icon: Gift },
  { name: 'Signage & Display Systems', icon: MonitorPlay },
  { name: 'Digital Services', icon: Palette },
  { name: 'Event & Personal Prints', icon: PartyPopper },
];

function findImage(id: string) {
  return PlaceHolderImages.find((img) => img.id === id);
}

export default function ProductsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [sortOption, setSortOption] = useState('popularity-desc');

    const handleCategoryChange = (categoryName: string, checked: boolean | string) => {
        if (checked) {
            setSelectedCategories(prev => [...prev, categoryName]);
        } else {
            setSelectedCategories(prev => prev.filter(c => c !== categoryName));
        }
    };

    const filteredAndSortedProducts = useMemo(() => {
        let products = allProducts;

        // Filter by search term
        if (searchTerm) {
            products = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        // Filter by categories
        if (selectedCategories.length > 0) {
            products = products.filter(p => selectedCategories.includes(p.category));
        }

        // Sort products
        products.sort((a, b) => {
            const [key, order] = sortOption.split('-');
            const valA = a[key as keyof typeof a];
            const valB = b[key as keyof typeof b];

            if (typeof valA === 'string' && typeof valB === 'string') {
                return order === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
            }
            if (typeof valA === 'number' && typeof valB === 'number') {
                return order === 'asc' ? valA - valB : valB - valA;
            }
            return 0;
        });

        return products;
    }, [searchTerm, selectedCategories, sortOption]);

    return (
        <div className="container mx-auto max-w-7xl px-4 py-16 md:py-24">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold font-headline">Our Products</h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                    Explore our extensive catalog of customizable products, designed to make your brand stand out.
                </p>
            </div>

            <div className="grid lg:grid-cols-4 gap-8">
                {/* Filters Sidebar */}
                <aside className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>Filters</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <h3 className="font-semibold mb-3">Search</h3>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        placeholder="Search products..."
                                        className="pl-9"
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-3">Category</h3>
                                <div className="space-y-3">
                                    {categories.map(category => (
                                        <div key={category.name} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={category.name}
                                                onCheckedChange={(checked) => handleCategoryChange(category.name, checked)}
                                                checked={selectedCategories.includes(category.name)}
                                            />
                                            <Label htmlFor={category.name} className="font-normal cursor-pointer">{category.name}</Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </aside>

                {/* Products Grid */}
                <main className="lg:col-span-3">
                    <div className="flex justify-between items-center mb-6">
                        <p className="text-sm text-muted-foreground">
                            Showing {filteredAndSortedProducts.length} of {allProducts.length} products
                        </p>
                        <div className="flex items-center gap-2">
                            <Label htmlFor="sort-by" className="text-sm">Sort by:</Label>
                            <Select value={sortOption} onValueChange={setSortOption}>
                                <SelectTrigger id="sort-by" className="w-[180px]">
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="popularity-desc">Popularity</SelectItem>
                                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                                    <SelectItem value="name-asc">Name: A to Z</SelectItem>
                                    <SelectItem value="name-desc">Name: Z to A</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    
                    {filteredAndSortedProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredAndSortedProducts.map((product) => {
                                const image = findImage(product.id);
                                return (
                                    <Card key={product.id} className="overflow-hidden group transition-shadow duration-300 hover:shadow-xl">
                                        <div className="overflow-hidden">
                                            <div className="aspect-[4/3] relative">
                                                {image ? (
                                                    <Image
                                                        src={image.imageUrl}
                                                        alt={product.name}
                                                        fill
                                                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                                                        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                                                        data-ai-hint={image.imageHint}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-muted flex items-center justify-center">
                                                        <Package className="w-12 h-12 text-muted-foreground" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <CardContent className="p-4">
                                            <h3 className="font-semibold text-lg truncate">{product.name}</h3>
                                            <p className="text-sm text-muted-foreground">{product.category}</p>
                                            <p className="font-bold text-lg mt-2">₦{product.price.toLocaleString()}</p>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-24 bg-card rounded-lg border border-dashed">
                            <Search className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-medium">No Products Found</h3>
                            <p className="mt-1 text-sm text-muted-foreground">Try adjusting your filters to find what you're looking for.</p>
                            <Button variant="outline" className="mt-6" onClick={() => { setSearchTerm(''); setSelectedCategories([]); }}>
                                Clear Filters
                            </Button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
