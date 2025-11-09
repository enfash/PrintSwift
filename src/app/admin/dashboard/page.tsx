
'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import {
  Package,
  Tags,
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
    title: 'Active Promos',
    value: '3',
    icon: <Megaphone className="h-6 w-6 text-red-500" />,
  },
];

const recentActivity = [
    { description: 'You added "Business Cards"', time: '1h ago' },
    { description: 'You updated "12oz Paper Cup"', time: '2h ago' },
    { description: 'Promo "Black Friday" activated', time: '1d ago' },
];

export default function Dashboard() {
  return (
    <div className="space-y-8">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
            <CardDescription>A log of the most recent changes to your store.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start">
                        <div className="flex flex-col items-center mr-4 pt-1">
                            <div className="w-3 h-3 bg-primary rounded-full"></div>
                            {index < recentActivity.length - 1 && <div className="w-px h-8 bg-border"></div>}
                        </div>
                        <div className="flex-grow flex justify-between">
                            <p className="text-sm">{activity.description}</p>
                            <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                    </div>
                ))}
            </div>
          </CardContent>
        </Card>
    </div>
  );
}

    