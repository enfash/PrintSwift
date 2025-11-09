
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const activities = [
  { user: 'Alice J.', action: 'created', target: 'Product: "New Sticker Pack"', time: '2 min ago', avatar: '/avatars/01.png' },
  { user: 'Ben C.', action: 'updated', target: 'Category: "Apparel"', time: '1 hour ago', avatar: '/avatars/02.png' },
  { user: 'Admin', action: 'approved', target: 'Quote: QT-003', time: '3 hours ago', avatar: '/avatars/03.png' },
  { user: 'Cathy D.', action: 'deleted', target: 'Promo: "Old Sale"', time: '1 day ago', avatar: '/avatars/04.png' },
  { user: 'Alice J.', action: 'updated', target: 'Order: ORD-001 to Shipped', time: '2 days ago', avatar: '/avatars/01.png' },
];

const getActionBadge = (action: string) => {
    switch(action) {
        case 'created': return 'default';
        case 'updated': return 'secondary';
        case 'deleted': return 'destructive';
        case 'approved': return 'outline';
        default: return 'secondary';
    }
}

export default function ActivityLogPage() {
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
                        {activities.map((activity, index) => (
                             <div key={index} className="flex items-center gap-4">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={activity.avatar} alt="Avatar" />
                                    <AvatarFallback>{activity.user.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="grid gap-1">
                                    <p className="text-sm font-medium leading-none">
                                        <span className="font-semibold">{activity.user}</span>
                                        <Badge variant={getActionBadge(activity.action)} className="mx-2">{activity.action}</Badge>
                                        <span>{activity.target}</span>
                                    </p>
                                    <p className="text-sm text-muted-foreground">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </>
    );
}
