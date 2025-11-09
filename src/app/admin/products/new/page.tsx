
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function NewProductPage() {
    return (
        <>
            <h1 className="text-3xl font-bold tracking-tight">Add New Product</h1>
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Product Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form className="space-y-6">
                        <div>
                            <Label htmlFor="product-name">Product Name</Label>
                            <Input id="product-name" placeholder="e.g., Custom Mugs" />
                        </div>
                        <Button>Save Product</Button>
                    </form>
                </CardContent>
            </Card>
        </>
    );
}
