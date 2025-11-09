
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UploadCloud } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';

export default function NewProductPage() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Add New Product</h1>
                <div className="flex items-center gap-2">
                    <Button variant="outline">Delete</Button>
                    <Button>Save Product</Button>
                </div>
            </div>

            <div className="grid gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Info</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <Label htmlFor="product-name">Product Title</Label>
                            <Input id="product-name" placeholder="e.g., Custom Mugs" />
                        </div>
                        <div>
                            <Label htmlFor="product-slug">Slug</Label>
                            <Input id="product-slug" placeholder="custom-mugs" readOnly value="business-cards" />
                        </div>
                        <div>
                           <Label htmlFor="product-category">Category</Label>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="prints">Prints</SelectItem>
                                    <SelectItem value="cups">Cups</SelectItem>
                                    <SelectItem value="banners">Banners</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                           <Label htmlFor="short-description">Short Description</Label>
                           <Textarea id="short-description" placeholder="A brief summary of the product." />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Media</CardTitle>
                        <CardDescription>Upload images for your product.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted transition">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <UploadCloud className="w-8 h-8 mb-3 text-muted-foreground"/>
                                <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                            </div>
                            <Input type="file" className="hidden" multiple />
                        </div>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle>Specifications</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                         <div>
                            <Label>Price Range</Label>
                            <div className="flex items-center gap-4">
                                <Input placeholder="Min price" />
                                <Input placeholder="Max price" />
                            </div>
                        </div>
                         <div>
                            <Label htmlFor="moq">Minimum Order Quantity (MOQ)</Label>
                            <Input id="moq" placeholder="e.g., 100" />
                        </div>
                         <div>
                            <Label htmlFor="lead-time">Lead Time</Label>
                            <Input id="lead-time" placeholder="e.g., 1–3 days" />
                        </div>
                        <Separator />
                         <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="status">Status</Label>
                                <p className="text-sm text-muted-foreground">Set product visibility.</p>
                            </div>
                            <Select defaultValue="draft">
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="published">Published</SelectItem>
                                    <SelectItem value="draft">Draft</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                             <div>
                                <Label htmlFor="featured">Featured Product</Label>
                                <p className="text-sm text-muted-foreground">Display this product on the homepage.</p>
                            </div>
                            <Switch id="featured" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Artwork Requirements</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="artwork-guidelines">Guidelines</Label>
                            <Textarea id="artwork-guidelines" placeholder="e.g., High-resolution PDF, 300 DPI, CMYK color mode." />
                        </div>
                        <div>
                            <Label htmlFor="artwork-template">Upload Template File (Optional)</Label>
                             <Input id="artwork-template" type="file" />
                        </div>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle>SEO Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <Label htmlFor="seo-title">SEO Title</Label>
                            <Input id="seo-title" placeholder="Product Title | Bomedia" />
                        </div>
                         <div>
                            <Label htmlFor="seo-description">SEO Description</Label>
                           <Textarea id="seo-description" placeholder="A concise and compelling description for search engines." />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

    