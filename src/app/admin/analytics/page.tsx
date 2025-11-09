
'use client';

import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
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
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';

const revenueData = [
  { date: '01/11', revenue: 186000 },
  { date: '02/11', revenue: 305000 },
  { date: '03/11', revenue: 237000 },
  { date: '04/11', revenue: 73000 },
  { date: '05/11', revenue: 209000 },
  { date: '06/11', revenue: 214000 },
  { date: '07/11', revenue: 450000 },
];

const ordersByStatusData = [
    { status: 'Delivered', orders: 120 },
    { status: 'Production', orders: 80 },
    { status: 'Awaiting Pay', orders: 50 },
    { status: 'Cancelled', orders: 15 },
]

const topProductsData = [
    { product: 'Biz Cards', revenue: 1200000 },
    { product: 'Paper Cups', revenue: 850000 },
    { product: 'Banners', revenue: 400000 },
    { product: 'T-shirts', revenue: 350000 },
    { product: 'Stickers', revenue: 150000 },
];

const quoteFunnelData = [
    { stage: 'Sent', value: 100 },
    { stage: 'Won', value: 42 },
    { stage: 'Converted', value: 35 },
];


export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <div className="flex items-center gap-2">
            <Select defaultValue="this-month">
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
          <CardContent><div className="text-2xl font-bold">7,450,000</div><p className="text-xs text-muted-foreground">+20.1% from last month</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Orders</CardTitle><ShoppingCart className="h-4 w-4 text-muted-foreground" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">128</div><p className="text-xs text-muted-foreground">+18.3% from last month</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Avg Order ₦</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">58,203</div><p className="text-xs text-muted-foreground">+1.1% from last month</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Quote Win Rate</CardTitle><Percent className="h-4 w-4 text-muted-foreground" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">42%</div><p className="text-xs text-muted-foreground">+5% from last month</p></CardContent>
        </Card>
      </div>

       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
         <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Revenue Over Time</CardTitle></CardHeader>
          <CardContent><ChartContainer config={{}} className="h-[250px] w-full"><LineChart data={revenueData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}><CartesianGrid vertical={false} /><XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} /><YAxis tickFormatter={(v) => `${v/1000}k`}/><ChartTooltip content={<ChartTooltipContent />} /><Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} /></LineChart></ChartContainer></CardContent>
        </Card>
         <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Orders by Status</CardTitle></CardHeader>
          <CardContent><ChartContainer config={{}} className="h-[250px] w-full"><BarChart data={ordersByStatusData} layout="vertical" margin={{ top: 5, right: 10, left: -10, bottom: 0 }}><CartesianGrid horizontal={false} /><YAxis dataKey="status" type="category" tickLine={false} axisLine={false} tickMargin={8} className="text-xs" /><XAxis type="number" hide={true} /><ChartTooltip content={<ChartTooltipContent />} /><Bar dataKey="orders" fill="hsl(var(--primary))" radius={4} /></BarChart></ChartContainer></CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Top Products by Revenue</CardTitle></CardHeader>
          <CardContent><ChartContainer config={{}} className="h-[250px] w-full"><BarChart data={topProductsData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}><CartesianGrid vertical={false} /><XAxis dataKey="product" tickLine={false} axisLine={false} tickMargin={8} /><YAxis tickFormatter={(v) => `${v/1000000}m`}/><ChartTooltip content={<ChartTooltipContent />} /><Bar dataKey="revenue" fill="hsl(var(--primary))" radius={4} /></BarChart></ChartContainer></CardContent>
        </Card>
         <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Quote Funnel</CardTitle></CardHeader>
          <CardContent><ChartContainer config={{}} className="h-[250px] w-full"><BarChart data={quoteFunnelData} layout="vertical" margin={{ top: 5, right: 10, left: -10, bottom: 0 }}><CartesianGrid horizontal={false} /><YAxis dataKey="stage" type="category" tickLine={false} axisLine={false} tickMargin={8} className="text-xs" /><XAxis type="number" hide={true}/><ChartTooltip content={<ChartTooltipContent />} /><Bar dataKey="value" fill="hsl(var(--primary))" radius={4} /></BarChart></ChartContainer></CardContent>
        </Card>
       </div>
       <Card>
         <CardHeader>
            <CardTitle>Filters & Goals</CardTitle>
         </CardHeader>
         <CardContent className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
                <h3 className="font-semibold">Filter Data</h3>
                <div className="flex flex-wrap gap-2">
                    <Select><SelectTrigger className="w-40"><SelectValue placeholder="Channel"/></SelectTrigger></Select>
                    <Select><SelectTrigger className="w-40"><SelectValue placeholder="Category"/></SelectTrigger></Select>
                    <Select><SelectTrigger className="w-40"><SelectValue placeholder="Customer"/></SelectTrigger></Select>
                </div>
            </div>
            <div className="space-y-2">
                 <h3 className="font-semibold">Set Monthly Target ₦</h3>
                 <div className="flex items-center gap-2">
                    <Input placeholder="e.g., 10,000,000"/>
                    <Button>Set Target</Button>
                 </div>
                 <Progress value={72} className="mt-2" />
                 <p className="text-sm text-muted-foreground text-right">72% of target reached</p>
            </div>
         </CardContent>
       </Card>
    </div>
  );
}

