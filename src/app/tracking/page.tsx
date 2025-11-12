
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Package, LoaderCircle, AlertTriangle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

type OrderStatus = 'pending' | 'in_production' | 'shipped' | 'delivered' | 'not_found' | null;

const OrderStatusDisplay = ({ status, orderId }: { status: OrderStatus, orderId: string }) => {
    if (!status) return null;

    if (status === 'not_found') {
        return (
            <Card className="mt-8 border-destructive">
                <CardHeader className="flex-row items-center gap-4">
                    <AlertTriangle className="h-8 w-8 text-destructive" />
                    <div>
                        <CardTitle>Item Not Found</CardTitle>
                        <CardDescription>We couldn't find an order or quote with the ID "{orderId}". Please check the ID and try again.</CardDescription>
                    </div>
                </CardHeader>
            </Card>
        );
    }
    
    const statusInfo = {
        pending: { label: 'Pending', description: 'Your request has been received and is awaiting review.' },
        in_production: { label: 'In Production', description: 'Your order is currently being printed and prepared.' },
        shipped: { label: 'Shipped', description: 'Your order has been dispatched and is on its way.' },
        delivered: { label: 'Delivered', description: 'Your order has been successfully delivered.' },
    };
    
    const currentStatus = statusInfo[status as keyof typeof statusInfo];

    return (
        <Card className="mt-8">
            <CardHeader>
                <CardTitle>Status for #{orderId}</CardTitle>
                <CardDescription>Last updated: {new Date().toLocaleDateString()}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center space-x-4">
                    <Package className="h-10 w-10 text-primary" />
                    <div>
                        <p className="font-semibold text-lg">{currentStatus.label}</p>
                        <p className="text-muted-foreground">{currentStatus.description}</p>
                    </div>
                </div>
                <Separator className="my-6" />
                <div className="space-y-4">
                    <h4 className="font-semibold">Tracking History</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>Request received - {new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleString()}</li>
                         { (status === 'in_production' || status === 'shipped' || status === 'delivered') &&
                            <>
                                <li>Quote approved - {new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleString()}</li>
                                <li>Entered production - {new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toLocaleString()}</li>
                            </>
                         }
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
}


export default function TrackingPage() {
  const [orderId, setOrderId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<OrderStatus>(null);
  const [searchedId, setSearchedId] = useState('');

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId) return;

    setIsLoading(true);
    setSearchedId(orderId);
    
    // Fake delay to simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock logic to determine status
    if (orderId.includes('prod')) {
        setStatus('in_production');
    } else if (orderId.includes('ship')) {
        setStatus('shipped');
    } else if (orderId.includes('quote')) {
        setStatus('pending');
    }
    else {
        setStatus('not_found');
    }

    setIsLoading(false);
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-16 md:py-24">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-headline">Track Your Job</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Enter your order or quote ID below to see the latest status.
        </p>
      </div>

      <form onSubmit={handleTrackOrder}>
        <div className="flex w-full items-center space-x-2">
          <Input
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="Enter your Order or Quote ID (e.g., quote-123)"
            className="h-12 text-base"
          />
          <Button type="submit" size="lg" disabled={isLoading}>
            {isLoading ? (
                <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                </>
            ) : (
                <>
                    <Search className="mr-2 h-4 w-4" />
                    Track
                </>
            )}
          </Button>
        </div>
      </form>
      
      { (isLoading || status) && 
        <div className="mt-8">
            {isLoading ? (
                <div className="flex justify-center p-8">
                    <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <OrderStatusDisplay status={status} orderId={searchedId} />
            )}
        </div>
      }
    </div>
  );
}
