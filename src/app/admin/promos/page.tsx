
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const promos = [
    { id: '1', title: 'Black Friday', placement: 'Popup', active: true, dates: '25–30 Nov' },
    { id: '2', title: 'New Range', placement: 'Topbar', active: false, dates: '1–14 Dec' },
];

export default function PromosPage() {
    return (
        <>
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Active Promos</h1>
                 <Button>
                    <PlusCircle className="mr-2 h-4 w-4" /> Create Promo
                </Button>
            </div>
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Manage Promotions</CardTitle>
                    <CardDescription>Control popups and top-bar announcements.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Placement</TableHead>
                                <TableHead>Active</TableHead>
                                <TableHead>Start/End</TableHead>
                                <TableHead>Preview</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                           {promos.map(promo => (
                                <TableRow key={promo.id}>
                                    <TableCell className="font-medium">{promo.title}</TableCell>
                                    <TableCell>{promo.placement}</TableCell>
                                    <TableCell>
                                        <Badge variant={promo.active ? 'default' : 'secondary'}>
                                            {promo.active ? 'Yes' : 'No'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{promo.dates}</TableCell>
                                    <TableCell>
                                        <Button variant="outline" size="sm">View</Button>
                                    </TableCell>
                                </TableRow>
                           ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </>
    );
}

    