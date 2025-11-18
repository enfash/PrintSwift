
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { LoaderCircle, User, Package, FileText, ShieldAlert } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { useAdminRole } from '@/hooks/use-admin-role';

const useActivityFeed = () => {
    const firestore = useFirestore();
    const { isAdmin, isRoleLoading } = useAdminRole();

    const recentQuotesQuery = useMemoFirebase(
        () => (firestore && isAdmin) ? query(collection(firestore, 'quotes'), orderBy('updatedAt', 'desc'), limit(10)) : null,
        [firestore, isAdmin]
    );
    const recentProductsQuery = useMemoFirebase(
        () => (firestore && isAdmin) ? query(collection(firestore, 'products'), orderBy('updatedAt', 'desc'), limit(10)) : null,
        [firestore, isAdmin]
    );
    const recentCustomersQuery = useMemoFirebase(
        () => (firestore && isAdmin) ? query(collection(firestore, 'customers'), orderBy('createdAt', 'desc'), limit(10)) : null,
        [firestore, isAdmin]
    );

    const { data: quotes, isLoading: loadingQuotes } = useCollection<any>(recentQuotesQuery);
    const { data: products, isLoading: loadingProducts } = useCollection<any>(recentProductsQuery);
    const { data: customers, isLoading: loadingCustomers } = useCollection<any>(recentCustomersQuery);

    const isLoading = isRoleLoading || (isAdmin && (loadingQuotes || loadingProducts || loadingCustomers));

    const combinedFeed = React.useMemo(() => {
        if (!isAdmin || isLoading) return [];

        const quoteActivities = quotes?.map(q => ({
            id: q.id,
            type: 'Quote',
            icon: <FileText className="h-4 w-4" />,
            description: `${q.status === 'won' ? 'Converted to Order:' : 'Updated Quote:'} #${q.id.substring(0, 6)} for ${q.company || q.email}`,
            timestamp: q.updatedAt?.toDate(),
            link: `/admin/quotes/${q.id}`
        })) || [];
        
        const productActivities = products?.map(p => ({
            id: p.id,
            type: 'Product',
            icon: <Package className="h-4 w-4" />,
            description: `Updated Product: ${p.name}`,
            timestamp: p.updatedAt?.toDate(),
            link: `/admin/products/${p.id}`
        })) || [];

        const customerActivities = customers?.map(c => ({
            id: c.id,
            type: 'Customer',
            icon: <User className="h-4 w-4" />,
            description: `New Customer: ${c.name}`,
            timestamp: c.createdAt?.toDate(),
            link: `/admin/customers/${c.id}`
        })) || [];

        const allActivities = [...quoteActivities, ...productActivities, ...customerActivities];
        
        allActivities.sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0));

        return allActivities.slice(0, 15); // Return the top 15 most recent activities
    }, [quotes, products, customers, isLoading, isAdmin]);

    return { activities: combinedFeed, isLoading, isAdmin };
};

const getActionBadge = (action: string) => {
    switch(action) {
        case 'Quote': return 'default';
        case 'Product': return 'secondary';
        case 'Customer': return 'outline';
        default: return 'secondary';
    }
}

export default function ActivityLogPage() {
    const { activities, isLoading, isAdmin } = useActivityFeed();

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-48">
                <LoaderCircle className="h-8 w-8 animate-spin text-muted-foreground"/>
            </div>
        )
    }

    if (!isAdmin) {
         return (
             <Card className="mt-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><ShieldAlert /> Permission Denied</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>You do not have permission to view the activity log.</p>
                </CardContent>
             </Card>
        )
    }

    return (
        <>
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Activity Log</h1>
                <Button variant="outline">Export Log</Button>
            </div>

             <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Recent Team Activity</CardTitle>
                    <CardDescription>A log of all actions taken in the admin panel.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {isLoading ? (
                            <div className="flex justify-center items-center h-48">
                                <LoaderCircle className="h-8 w-8 animate-spin text-muted-foreground"/>
                            </div>
                        ) : activities.length > 0 ? (
                            activities.map((activity) => (
                                 <div key={activity.id + activity.type} className="flex items-start gap-4">
                                    <Avatar className="h-9 w-9 border">
                                        <div className="flex h-full w-full items-center justify-center bg-secondary text-secondary-foreground">
                                           {activity.icon}
                                        </div>
                                    </Avatar>
                                    <div className="grid gap-1">
                                        <div className="text-sm font-medium leading-none">
                                            <Badge variant={getActionBadge(activity.type)} className="mr-2">{activity.type}</Badge>
                                            <Link href={activity.link} className="hover:underline">{activity.description}</Link>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {activity.timestamp ? formatDistanceToNow(activity.timestamp, { addSuffix: true }) : 'Just now'}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                No recent activity found.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </>
    );
}
