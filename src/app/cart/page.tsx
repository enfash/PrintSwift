'use client';

import React from 'react';
import { useCart } from '@/context/cart-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, Image as ImageIcon, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { getSafeImageUrl } from '@/lib/utils';
import { Counter } from '@/components/ui/counter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function CartItem({ item }: { item: any }) {
  const { updateQuantity, removeFromCart } = useCart();

  return (
    <div className="flex items-start gap-4 py-4">
      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border">
        <Image
          src={getSafeImageUrl(item.image)}
          alt={item.name}
          fill
          sizes="100px"
          className="object-cover"
        />
      </div>
      <div className="flex-grow">
        <h3 className="font-semibold">{item.name}</h3>
        <div className="text-sm text-muted-foreground">
          {item.options.map((opt: any) => (
            <div key={opt.label}>
              {opt.label}: {opt.value}
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center justify-between">
          <Counter
            value={item.quantity}
            setValue={(newQuantity) => updateQuantity(item.id, newQuantity)}
            min={1}
          />
           <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => removeFromCart(item.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
       <div className="text-right">
            <p className="font-semibold">₦{item.price.toLocaleString()}</p>
        </div>
    </div>
  );
}

function CheckoutForm() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Contact Information</h3>
                <div className="mt-4">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" placeholder="you@example.com" />
                </div>
            </div>
            <div>
                <h3 className="text-lg font-medium">Shipping Information</h3>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" placeholder="John Doe" />
                    </div>
                     <div className="sm:col-span-2">
                        <Label htmlFor="address">Address</Label>
                        <Input id="address" placeholder="123 Printing Lane" />
                    </div>
                    <div>
                        <Label htmlFor="city">City</Label>
                        <Input id="city" placeholder="Lagos" />
                    </div>
                    <div>
                        <Label htmlFor="state">State</Label>
                        <Input id="state" placeholder="Lagos" />
                    </div>
                </div>
            </div>
             <div>
                <h3 className="text-lg font-medium">Payment Method</h3>
                <div className="mt-4 rounded-md border border-dashed p-8 text-center text-muted-foreground">
                    <p>Payment via secure link will be provided upon quote approval.</p>
                </div>
            </div>
        </div>
    )
}

export default function CartPage() {
  const { items, subtotal, total, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-24 text-center">
        <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
        <h1 className="mt-4 text-2xl font-semibold">Your Cart is Empty</h1>
        <p className="mt-2 text-muted-foreground">
          Looks like you haven't added any products yet.
        </p>
        <Button asChild className="mt-6">
          <Link href="/products">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Continue Shopping
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-16">
      <h1 className="text-3xl font-bold font-headline mb-8">Shopping Cart & Checkout</h1>
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
        
        {/* Left Side: Order Summary & Checkout Form */}
        <div className="lg:col-span-3">
             <Card>
                <CardHeader>
                    <CardTitle>Checkout</CardTitle>
                </CardHeader>
                <CardContent>
                    <CheckoutForm />
                </CardContent>
            </Card>
        </div>

        {/* Right Side: Cart Items */}
        <div className="lg:col-span-2">
          <Card className="sticky top-24">
            <CardHeader>
                <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[300px] w-full pr-4">
                    <div className="divide-y">
                    {items.map(item => (
                        <CartItem key={item.id} item={item} />
                    ))}
                    </div>
                </ScrollArea>
                <Separator className="my-4" />
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>Subtotal</span>
                        <span>₦{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span>Shipping (estimated)</span>
                        <span>₦0</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg">
                        <span>Total</span>
                        <span>₦{total.toLocaleString()}</span>
                    </div>
                </div>
                 <Button size="lg" className="w-full mt-6">
                    Place Order & Proceed to Payment
                </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
