
'use client';

import React, { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  DollarSign,
  ShoppingCart,
  Users,
  Percent,
  File,
  LoaderCircle,
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, Timestamp } from 'firebase/firestore';
import { startOfMonth, endOfMonth, subMonths, format, eachDayOfInterval, parseISO } from 'date-fns';

// --- Data Fetching Hook ---
const useAnalyticsData = (dateRange: 'this-month' | 'last-month') => {
    const firestore = useFirestore();

    const { startDate, endDate } = useMemo(() => {
        const now = new Date();
        if (dateRange === 'last-month') {
            const start = startOfMonth(subMonths(now, 1));
            const end = endOfMonth(subMonths(now, 1));
            return { startDate: start, endDate: end };
        }
        // Default to this month
        return { startDate: startOfMonth(now), endDate: endOfMonth(now) };
    }, [dateRange]);

    const quotesQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(
            collection(firestore, 'quotes'),
            where('createdAt', '>=', Timestamp.fromDate(startDate)),
            where('createdAt', '<=', Timestamp.fromDate(endDate))
        );
    }, [firestore, startDate, endDate]);

    const { data: quotes, isLoading } = useCollection<any>(quotesQuery);

    return { quotes, isLoading, dateRange: { startDate, endDate } };
};


// --- Analytics Calculation Logic ---
const processAnalytics = (quotes: any[] | null, dateRange: { startDate: Date, endDate: Date }) => {
    if (!quotes) {
        return {
            kpis: { revenue: 0, orders: 0, avgOrderValue: 0, quoteWinRate: 0, totalSent: 0 },
            revenueData: [],
            ordersByStatusData: [],
            topProductsData: [],
            quoteFunnelData: [],
        };
    }
    
    const wonQuotes = quotes.filter(q => q.status === 'won');
    const sentQuotes = quotes.filter(q => ['sent', 'won', 'lost'].includes(q.status));

    // KPIs
    const revenue = wonQuotes.reduce((acc, q) => acc + (q.total || 0), 0);
    const orders = wonQuotes.length;
    const avgOrderValue = orders > 0 ? revenue / orders : 0;
    const quoteWinRate = sentQuotes.length > 0 ? (orders / sentQuotes.length) * 100 : 0;
    
    const kpis = { revenue, orders, avgOrderValue, quoteWinRate, totalSent: sentQuotes.length };

    // Revenue Over Time
    const interval = eachDayOfInterval({ start: dateRange.startDate, end: dateRange.endDate });
    const revenueByDay = interval.reduce((acc, date) => {
        acc[format(date, 'yyyy-MM-dd')] = 0;
        return acc;
    }, {} as Record<string, number>);

    wonQuotes.forEach(q => {
        if (q.createdAt) {
            const dateStr = format(q.createdAt.toDate(), 'yyyy-MM-dd');
            if (revenueByDay[dateStr] !== undefined) {
                revenueByDay[dateStr] += q.total || 0;
            }
        }
    });
    const revenueData = Object.entries(revenueByDay).map(([date, revenue]) => ({
        date: format(parseISO(date), 'dd/MM'),
        revenue,
    }));


    // Orders by Status
    const ordersByStatus = wonQuotes.reduce((acc, order) => {
        const status = order.productionStatus || 'Awaiting Artwork';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    const ordersByStatusData = Object.entries(ordersByStatus).map(([status, orders]) => ({ status, orders }));

    // Top Products by Revenue
    const productRevenue: Record<string, number> = {};
    wonQuotes.forEach(q => {
        q.lineItems?.forEach((item: any) => {
            const revenue = item.qty * item.unitPrice;
            productRevenue[item.productName] = (productRevenue[item.productName] || 0) + revenue;
        });
    });
    const topProductsData = Object.entries(productRevenue)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([product, revenue]) => ({ product, revenue }));
    
    // Quote Funnel
    const quoteFunnelData = [
        { stage: 'Sent', value: sentQuotes.length },
        { stage: 'Won', value: wonQuotes.length },
        { stage: 'Lost', value: quotes.filter(q => q.status === 'lost').length },
    ];


    return { kpis, revenueData, ordersByStatusData, topProductsData, quoteFunnelData };
};


export default function AnalyticsPage() {
    const [dateRange, setDateRange] = useState<'this-month' | 'last-month'>('this-month');
    const { quotes, isLoading } = useAnalyticsData(dateRange);
    
    const { kpis, revenueData, ordersByStatusData, topProductsData, quoteFunnelData } = processAnalytics(quotes, useMemo(() => {
        const now = new Date();
        if (dateRange === 'last-month') {
            const start = startOfMonth(subMonths(now, 1));
            const end = endOfMonth(subMonths(now, 1));
            return { startDate: start, endDate: end };
        }
        return { startDate: startOfMonth(now), endDate: endOfMonth(now) };
    }, [dateRange]));

  if (isLoading) {
      return (
          <div className="flex h-full w-full items-center justify-center">
              <LoaderCircle className="h-10 w-10 animate-spin" />
          </div>
      )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <div className="flex items-center gap-2">
            <Select value={dateRange} onValueChange={(value: 'this-month' | 'last-month') => setDateRange(value)}>
                <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="this-month">This Month</SelectItem>
                    <SelectItem value="last-month">Last Month</SelectItem>
                </SelectContent>
            </Select>
            <Button variant="outline"><File className="mr-2 h-4 w-4"/>Export CSV</Button>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Revenue ₦</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">{kpis.revenue.toLocaleString()}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Orders</CardTitle><ShoppingCart className="h-4 w-4 text-muted-foreground" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">{kpis.orders}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Avg Order ₦</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">{kpis.avgOrderValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Quote Win Rate</CardTitle><Percent className="h-4 w-4 text-muted-foreground" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">{kpis.quoteWinRate.toFixed(1)}%</div></CardContent>
        </Card>
      </div>

       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
         <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Revenue Over Time</CardTitle></CardHeader>
          <CardContent><ChartContainer config={{}} className="h-[250px] w-full"><LineChart data={revenueData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}><CartesianGrid vertical={false} /><XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} /><YAxis tickFormatter={(v) => `${v/1000}k`}/><Tooltip content={<ChartTooltipContent />} /><Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} /></LineChart></ChartContainer></CardContent>
        </Card>
         <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Orders by Status</CardTitle></CardHeader>
          <CardContent><ChartContainer config={{}} className="h-[250px] w-full"><BarChart data={ordersByStatusData} layout="vertical" margin={{ top: 5, right: 10, left: -10, bottom: 0 }}><CartesianGrid horizontal={false} /><YAxis dataKey="status" type="category" tickLine={false} axisLine={false} tickMargin={8} className="text-xs" width={100} /><XAxis type="number" hide={true} /><Tooltip content={<ChartTooltipContent />} /><Bar dataKey="orders" fill="hsl(var(--primary))" radius={4} /></BarChart></ChartContainer></CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Top Products by Revenue</CardTitle></CardHeader>
          <CardContent>
            {topProductsData.length > 0 ? (
                <ChartContainer config={{}} className="h-[250px] w-full">
                    <BarChart data={topProductsData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="product" tickLine={false} axisLine={false} tickMargin={8} />
                        <YAxis tickFormatter={(v) => `${v/1000}k`} />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={4} />
                    </BarChart>
                </ChartContainer>
            ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">No product data for this period.</div>
            )}
          </CardContent>
        </Card>
         <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Quote Funnel</CardTitle></CardHeader>
           <CardContent>
            {quoteFunnelData[0].value > 0 ? (
                <ChartContainer config={{}} className="h-[250px] w-full">
                    <BarChart data={quoteFunnelData} layout="vertical" margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                        <CartesianGrid horizontal={false} />
                        <YAxis dataKey="stage" type="category" tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                        <XAxis type="number" hide={true} />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="value" fill="hsl(var(--primary))" radius={4} />
                    </BarChart>
                </ChartContainer>
             ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">No quote data for this period.</div>
             )}
          </CardContent>
        </Card>
       </div>
    </div>
  );
}
