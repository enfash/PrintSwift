
'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MoreVertical, Search, UploadCloud } from 'lucide-react';
import Image from 'next/image';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const artworkItems = [
    { id: 1, name: 'logo_final_v2.ai', size: '2.3 MB', type: 'AI', order: 'ORD-001', imageUrl: 'https://picsum.photos/seed/ai-file/400/300' },
    { id: 2, name: 'banner-design.psd', size: '15.1 MB', type: 'PSD', order: 'ORD-002', imageUrl: 'https://picsum.photos/seed/psd-file/400/300' },
    { id: 3, name: 'cup-artwork.pdf', size: '800 KB', type: 'PDF', order: 'ORD-001', imageUrl: 'https://picsum.photos/seed/pdf-file/400/300' },
    { id: 4, name: 'tshirt-graphic.png', size: '1.2 MB', type: 'PNG', order: 'ORD-003', imageUrl: 'https://picsum.photos/seed/png-file/400/300' },
];

export default function ArtworkPage() {
    return (
        <>
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Artwork Library</h1>
                 <div className="relative ml-auto flex-1 md:grow-0">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search artwork..."
                        className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
                    />
                </div>
            </div>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                <Card className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted transition">
                    <div className="flex flex-col items-center justify-center text-center">
                        <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground"/>
                        <p className="text-sm font-semibold text-foreground">Upload New Artwork</p>
                        <p className="text-xs text-muted-foreground">Drag & drop or click</p>
                    </div>
                </Card>

                {artworkItems.map(item => (
                    <Card key={item.id} className="overflow-hidden">
                        <CardHeader className="p-0">
                            <div className="aspect-video relative bg-muted">
                                <Image src={item.imageUrl} alt={item.name} layout="fill" objectFit="contain" className="p-4" />
                            </div>
                        </CardHeader>
                        <CardContent className="p-4">
                            <p className="text-sm font-medium truncate">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{item.size}</p>
                        </CardContent>
                        <CardFooter className="p-4 pt-0 flex justify-between items-center">
                             <Badge variant="secondary">{item.type}</Badge>
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button size="icon" variant="ghost" className="h-8 w-8">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem>View Details</DropdownMenuItem>
                                    <DropdownMenuItem>Download File</DropdownMenuItem>
                                    <DropdownMenuItem>Link to Order: {item.order}</DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </>
    )
}
