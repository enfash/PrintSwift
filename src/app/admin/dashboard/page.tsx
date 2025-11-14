
'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import {
  DollarSign,
  ShoppingCart,
  FileText,
  Percent,
  LoaderCircle,
  ShieldAlert,
} from 'lucide-react';
import Link from 'next/link';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where, orderBy, limit } from 'firebase/firestore';
import { useMemo } from 'react';
import { format } from 'date-fns';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getStatusVariant } from '@/lib/utils';
import { useAdminRole } from '@/hooks/use-admin-role';


const kpiCards = [
  {
    title: 'Total Revenue (All Time)',
    key: 'revenue',
    icon: <DollarSign className="h-6 w-6 text-muted-foreground" />,
    formatter: (value: number) => `₦${value.toLocaleString()}`,
  },
  {
    title: 'Total Orders (All Time)',
    key: 'orders',
    icon: <ShoppingCart className="h-6 w-6 text-muted-foreground" />,
    formatter: (value: number) => value.toLocaleString(),
  },
  {
    title: 'Pending Quote Requests',
    key: 'pendingRequests',
    icon: <FileText className="h-6 w-6 text-muted-foreground" />,
    formatter: (value: number) => value.toLocaleString(),
  },
   {
    title: 'Conversion Rate',
    key: 'conversionRate',
    icon: <Percent className="h-6 w-6 text-muted-foreground" />,
    formatter: (value: number) => `${value.toFixed(1)}%`,
  },
];


export default function Dashboard() {
  const { isAdmin, isRoleLoading } = useAdminRole();
  const firestore = useFirestore();

  const quotesQuery = useMemoFirebase(
    () => isAdmin ? query(collection(firestore, 'quotes')) : null,
    [isAdmin, firestore]
  );
  
  const requestsQuery = useMemoFirebase(
    () => isAdmin ? query(collection(firestore, 'quote_requests'), orderBy('submissionDate', 'desc'), limit(5)) : null,
    [isAdmin, firestore]
  );

  const { data: quotes, isLoading: isLoadingQuotes } = useCollection<any>(quotesQuery);
  const { data: recentRequests, isLoading: isLoadingRequests } = useCollection<any>(requestsQuery);
  
  const recentOrders = useMemo(() => {
    if (!quotes) return [];
    return quotes
      .filter(q => q.status === 'won')
      .sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate())
      .slice(0, 5);
  }, [quotes]);


  const stats = useMemo(() => {
    if (!quotes || !recentRequests) {
        return { revenue: 0, orders: 0, pendingRequests: 0, conversionRate: 0 };
    }

    const wonQuotes = quotes.filter(q => q.status === 'won');
    const revenue = wonQuotes.reduce((acc, q) => acc + (q.total || 0), 0);
    const orders = wonQuotes.length;
    
    const sentOrWonQuotes = quotes.filter(q => q.status === 'sent' || q.status === 'won').length;
    const conversionRate = sentOrWonQuotes > 0 ? (orders / sentOrWonQuotes) * 100 : 0;
    
    const pendingRequests = recentRequests.filter(r => (r.status || 'Pending') === 'Pending').length;

    return { revenue, orders, pendingRequests, conversionRate };
  }, [quotes, recentRequests]);
  
  const revenueChartData = useMemo(() => {
    if (!quotes) return [];
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return format(d, 'MMM dd');
    }).reverse();

    const data = last7Days.map(day => ({
        name: day,
        total: 0,
    }));

    quotes.forEach(quote => {
        if (quote.status === 'won' && quote.createdAt) {
            const day = format(quote.createdAt.toDate(), 'MMM dd');
            const index = data.findIndex(d => d.name === day);
            if (index !== -1) {
                data[index].total += quote.total;
            }
        }
    });

    return data;
  }, [quotes]);
  

  const isLoading = isRoleLoading || isLoadingQuotes || isLoadingRequests;
  
  if (isLoading) {
    return (
        <div className="flex h-full w-full items-center justify-center">
            <LoaderCircle className="h-10 w-10 animate-spin" />
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
                <p>You do not have permission to view this page. Please contact an administrator if you believe this is an error.</p>
            </CardContent>
         </Card>
    )
  }

  return (
    <div className="space-y-8">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {kpiCards.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                        {stat.icon}
                        </CardHeader>
                        <CardContent>
                        <div className="text-2xl font-bold">{stat.formatter(stats[stat.key as keyof typeof stats])}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
                <CardHeader>
                    <CardTitle>Weekly Revenue</CardTitle>
                    <CardDescription>Revenue from "won" quotes over the last 7 days.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={revenueChartData}>
                            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₦${value/1000}k`} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--background))',
                                    border: '1px solid hsl(var(--border))',
                                }}
                                labelStyle={{ color: 'hsl(var(--foreground))' }}
                                formatter={(value: number) => [`₦${value.toLocaleString()}`, 'Revenue']}
                            />
                            <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest orders and incoming quote requests.</CardDescription>
                </CardHeader>
                <CardContent>
                    <h4 className="font-semibold mb-2">Recent Orders</h4>
                     {recentOrders.length > 0 ? (
                        <Table>
                            <TableBody>
                                {recentOrders.map(order => (
                                    <TableRow key={order.id}>
                                        <TableCell>
                                            <div className="font-medium">{order.company || order.email}</div>
                                            <div className="text-xs text-muted-foreground">₦{order.total.toLocaleString()}</div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Link href={`/admin/orders`}>
                                                <Badge variant={getStatusVariant(order.productionStatus || "Awaiting Artwork")}>{order.productionStatus || "Awaiting Artwork"}</Badge>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">No recent orders.</p>
                    )}
                    
                    <h4 className="font-semibold mt-6 mb-2">New Quote Requests</h4>
                    {recentRequests.length > 0 ? (
                        <Table>
                             <TableBody>
                                {recentRequests.map(req => (
                                    <TableRow key={req.id}>
                                        <TableCell>
                                            <div className="font-medium">{req.name}</div>
                                            <div className="text-xs text-muted-foreground">{req.productName}</div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                             <Button asChild variant="outline" size="sm">
                                                <Link href={`/admin/quotes/new?request_id=${req.id}`}>Create Quote</Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">No new quote requests.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
