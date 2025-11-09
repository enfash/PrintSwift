
'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Package,
  Tags,
  MessageSquareQuote,
  Megaphone,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const stats = [
  {
    title: 'Total Products',
    value: '128',
    icon: <Package className="h-6 w-6 text-primary" />,
  },
  {
    title: 'Total Categories',
    value: '12',
    icon: <Tags className="h-6 w-6 text-green-500" />,
  },
  {
    title: 'Active Testimonials',
    value: '8',
    icon: <MessageSquareQuote className="h-6 w-6 text-yellow-500" />,
  },
  {
    title: 'Active Promos',
    value: '3',
    icon: <Megaphone className="h-6 w-6 text-red-500" />,
  },
];

const recentActivity = [
    { description: 'You updated Product: 12oz Paper Cups', time: '2 h ago' },
    { description: 'You created Product: Business Cards', time: '1 dy ago' },
    { description: 'You added Promo: Summer Sale', time: '2 dy ago' },
];

const quickLinks = [
  { title: 'Add New Product', href: '/admin/products/new' },
  { title: 'Upload Media', href: '/admin/media' },
  { title: 'Create Promo', href: '/admin/promos' },
  { title: 'View Website', href: '/' },
];

export default function Dashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-2 space-y-8">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                <Card key={stat.title}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    {stat.icon}
                    </CardHeader>
                    <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    </CardContent>
                </Card>
                ))}
            </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
                {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start">
                        <div className="flex flex-col items-center mr-4">
                            <div className="w-3 h-3 bg-primary rounded-full"></div>
                            {index < recentActivity.length - 1 && <div className="w-px h-12 bg-border"></div>}
                        </div>
                        <div className="flex-grow">
                            <p className="text-sm">{activity.description}</p>
                            <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                    </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {quickLinks.map((link) => (
              <Button asChild key={link.title} variant="outline" className="w-full justify-start">
                <Link href={link.href}>
                  {link.title}
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
