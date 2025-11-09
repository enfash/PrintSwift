
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

const testimonials = [
    { id: '1', name: 'Chidi A.', rating: 5, location: 'Lagos', visible: true },
    { id: '2', name: 'Temi O.', rating: 4, location: 'Ikeja', visible: false },
    { id: '3', name: 'Mariam K.', rating: 5, location: 'Yaba', visible: true },
];

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
                <svg
                    key={i}
                    className={`h-4 w-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.368-2.448a1 1 0 00-1.175 0l-3.368 2.448c-.784.57-1.838-.197-1.54-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.099 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.049 2.927z" />
                </svg>
            ))}
        </div>
    );
}

export default function TestimonialsPage() {
    return (
        <>
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Testimonials</h1>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Testimonial
                </Button>
            </div>
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Manage Testimonials</CardTitle>
                    <CardDescription>Curate and display customer feedback.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Rating</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Visible</TableHead>
                                <TableHead>
                                    <span className="sr-only">Actions</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {testimonials.map(testimonial => (
                                <TableRow key={testimonial.id}>
                                    <TableCell className="font-medium">{testimonial.name}</TableCell>
                                    <TableCell><StarRating rating={testimonial.rating} /></TableCell>
                                    <TableCell>{testimonial.location}</TableCell>
                                    <TableCell>
                                        <Badge variant={testimonial.visible ? 'default' : 'secondary'}>
                                            {testimonial.visible ? 'Yes' : 'No'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                       <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">Toggle menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem>Edit</DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
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

    