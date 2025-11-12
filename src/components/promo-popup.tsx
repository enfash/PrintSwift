
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { LoaderCircle } from 'lucide-react';

const PROMO_SEEN_KEY = 'promo_seen_session';

export default function PromoPopup() {
    const [isOpen, setIsOpen] = useState(false);
    const firestore = useFirestore();

    const activePromoQuery = useMemoFirebase(() => 
        firestore 
        ? query(
            collection(firestore, 'promos'), 
            where('active', '==', true), 
            where('placement', '==', 'popup'), 
            limit(1)
          ) 
        : null, 
    [firestore]);
    
    const { data: promos, isLoading } = useCollection<any>(activePromoQuery);
    const activePromo = promos && promos.length > 0 ? promos[0] : null;

    useEffect(() => {
        if (isLoading || !activePromo) {
            return;
        }

        try {
            const hasSeenPromo = sessionStorage.getItem(PROMO_SEEN_KEY);
            if (!hasSeenPromo) {
                setIsOpen(true);
                sessionStorage.setItem(PROMO_SEEN_KEY, 'true');
            }
        } catch (error) {
            // This can happen in environments where sessionStorage is not available.
            console.warn('Could not access sessionStorage for promo popup.');
            // Fallback for environments without sessionStorage: just show it.
            if (!isOpen) { // Basic check to prevent loops
                setIsOpen(true);
            }
        }
    }, [activePromo, isLoading, isOpen]);
    
    if (!activePromo || !isOpen) {
        return null;
    }
    
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-2xl p-0 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 items-center">
                    {activePromo.imageUrl && (
                         <div className="relative h-64 md:h-full w-full">
                             <Image 
                                src={activePromo.imageUrl} 
                                alt={activePromo.title} 
                                fill 
                                className="object-cover"
                            />
                         </div>
                    )}
                    <div className="p-8 text-center md:text-left">
                        <h2 className="text-2xl font-bold font-headline mb-2">{activePromo.title}</h2>
                        <p className="text-muted-foreground mb-6">{activePromo.description}</p>
                        <Button asChild size="lg" className="w-full sm:w-auto">
                            <Link href={activePromo.ctaLink}>{activePromo.ctaText}</Link>
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
