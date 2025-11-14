
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit, Timestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const PROMO_SEEN_KEY = 'promo_seen_session';

export default function PromoPopup() {
    const [isOpen, setIsOpen] = useState(false);
    const firestore = useFirestore();

    const activePromoQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        
        return query(
            collection(firestore, 'promos'),
            where('active', '==', true),
            where('placement', '==', 'popup'),
            limit(1) // We only need one active popup promo
        );
    }, [firestore]);
    
    const { data: promos, isLoading } = useCollection<any>(activePromoQuery);
    
    const validPromos = promos?.filter(p => {
        const now = new Date();
        const startDate = p.startDate?.toDate();
        const endDate = p.endDate?.toDate();
        
        const isStarted = !startDate || startDate <= now;
        const isNotExpired = !endDate || endDate >= now;
        
        return isStarted && isNotExpired;
    });

    const activePromo = validPromos && validPromos.length > 0 ? validPromos[0] : null;

    useEffect(() => {
        if (isLoading || !activePromo) {
            return;
        }

        try {
            const promoKey = `${PROMO_SEEN_KEY}_${activePromo.id}`;
            const hasSeenPromo = sessionStorage.getItem(promoKey);
            if (!hasSeenPromo) {
                const timer = setTimeout(() => {
                    setIsOpen(true);
                    sessionStorage.setItem(promoKey, 'true');
                }, 2000);
                return () => clearTimeout(timer);
            }
        } catch (error) {
            console.warn('Could not access sessionStorage for promo popup.');
            const timer = setTimeout(() => {
                 setIsOpen(true);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [activePromo, isLoading]);
    
    if (!activePromo || !isOpen) {
        return null;
    }
    
    const contentStyle = activePromo.backgroundColor
        ? { backgroundColor: activePromo.backgroundColor }
        : {};

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent 
                className="sm:max-w-md md:max-w-lg lg:max-w-2xl p-0 overflow-hidden"
                style={contentStyle}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 items-center">
                    {activePromo.imageUrl && (
                         <div className="relative h-64 md:h-full w-full">
                             <Image 
                                src={activePromo.imageUrl} 
                                alt={activePromo.title} 
                                fill 
                                sizes="(max-width: 768px) 100vw, 50vw"
                                className="object-cover"
                            />
                         </div>
                    )}
                    <div className="p-8 text-center md:text-left">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-bold font-headline mb-2">{activePromo.title}</DialogTitle>
                          <DialogDescription className="text-muted-foreground mb-6">{activePromo.description}</DialogDescription>
                        </DialogHeader>
                        <Button asChild size="lg" className="w-full sm:w-auto" onClick={() => setIsOpen(false)}>
                            <Link href={activePromo.ctaLink}>{activePromo.ctaText}</Link>
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
