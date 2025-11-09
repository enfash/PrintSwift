
'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, UploadCloud } from 'lucide-react';

const mediaItems = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  url: `https://picsum.photos/seed/${i + 1}/400/300`,
  name: `image-${i + 1}.jpg`
}));


export default function MediaPage() {
    return (
        <>
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Media Library</h1>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" /> Upload Media
                </Button>
            </div>
            <Card className="mt-6">
                <CardContent className="p-4">
                     <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {mediaItems.map(item => (
                            <Card key={item.id} className="overflow-hidden group">
                                <div className="aspect-square relative">
                                    <Image 
                                        src={item.url}
                                        alt={item.name}
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Button variant="secondary" size="sm">View</Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                         <div className="flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted transition">
                            <div className="flex flex-col items-center justify-center">
                                <UploadCloud className="w-8 h-8 mb-3 text-muted-foreground"/>
                                <p className="text-sm text-muted-foreground">Upload</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </>
    );
}

    