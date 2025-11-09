
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
  PlusCircle,
  Upload,
  Eye,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const stats = [
  {
    title: 'Total Products',
    value: '250',
    icon: <Package className="h-6 w-6 text-primary" />,
  },
  {
    title: 'Total Categories',
    value: '9',
    icon: <Tags className="h-6 w-6 text-green-500" />,
  },
  {
    title: 'Active Testimonials',
    value: '12',
    icon: <MessageSquareQuote className="h-6 w-6 text-yellow-500" />,
  },
  {
    title: 'Active Promos',
    value: '3',
    icon: <Megaphone className="h-6 w-6 text-red-500" />,
  },
];

const quickLinks = [
  { title: 'Add New Product', href: '/admin/products/new', icon: PlusCircle },
  { title: 'Upload Media', href: '#', icon: Upload },
  { title: 'Create Promo', href: '#', icon: Megaphone },
  { title: 'View Website', href: '/', icon: Eye },
];

export default function Dashboard() {
  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

      {/* Top Stats */}
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

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        {/* Recent Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                No recent activity.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            {quickLinks.map((link) => (
              <Button asChild key={link.title} variant="outline">
                <Link href={link.href}>
                  <link.icon className="mr-2 h-4 w-4" />
                  {link.title}
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
