
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit, Timestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { X } from 'lucide-react';

const PROMO_STORAGE_PREFIX = 'promo_last_seen_';

export default function PromoPopup() {
    const [isOpen, setIsOpen] = useState(false);
    const firestore = useFirestore();

    const activePromoQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        
        return query(
            collection(firestore, 'promos'),
            where('active', '==', true),
            limit(1) // Fetch all active promos and filter client-side for placement
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

    const activePopup = validPromos?.find(p => p.placement === 'popup');
    const activeBanner = validPromos?.find(p => p.placement === 'top-banner');

    useEffect(() => {
        if (isLoading || !activePopup) {
            return;
        }

        try {
            const promoKey = `${PROMO_STORAGE_PREFIX}${activePopup.id}`;
            const lastSeenTimestamp = localStorage.getItem(promoKey);
            const intervalHours = activePopup.displayIntervalHours || 24;
            const intervalMillis = intervalHours * 60 * 60 * 1000;

            const shouldShow = !lastSeenTimestamp || (Date.now() - parseInt(lastSeenTimestamp, 10) > intervalMillis);

            if (shouldShow) {
                const timer = setTimeout(() => {
                    setIsOpen(true);
                    localStorage.setItem(promoKey, Date.now().toString());
                }, 2000);
                return () => clearTimeout(timer);
            }
        } catch (error) {
            console.warn('Could not access localStorage for promo popup.');
        }
    }, [activePopup, isLoading]);
    
    // Auto-dismiss logic for banner
    useEffect(() => {
        if (activeBanner && activeBanner.autoDismissSeconds > 0) {
            const timer = setTimeout(() => {
                 // A bit of a trick to 'remove' the banner by making it seem invalid
                 // In a real app, this might involve a state management library
                 const bannerElement = document.getElementById('promo-banner');
                 if (bannerElement) bannerElement.style.display = 'none';
            }, activeBanner.autoDismissSeconds * 1000);
            return () => clearTimeout(timer);
        }
    }, [activeBanner]);

    const renderPopup = () => {
        if (!activePopup || !isOpen) return null;
        
        const contentStyle = { 
            backgroundColor: activePopup.backgroundColor || '#ffffff' 
        };

        return (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent 
                    className="sm:max-w-md md:max-w-lg lg:max-w-2xl p-0 overflow-hidden"
                    style={contentStyle}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 items-center">
                        {activePopup.imageUrl && (
                             <div className="relative h-64 md:h-full w-full">
                                 <Image 
                                    src={activePopup.imageUrl} 
                                    alt={activePopup.title} 
                                    fill 
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    className="object-cover"
                                />
                             </div>
                        )}
                        <div className="p-8 text-center md:text-left">
                            <DialogHeader>
                              <DialogTitle 
                                className="text-2xl font-bold font-headline mb-2"
                                style={{ color: activePopup.titleColor || 'inherit' }}
                              >
                                {activePopup.title}
                              </DialogTitle>
                              <DialogDescription 
                                className="mb-6"
                                style={{ color: activePopup.descriptionColor || 'inherit' }}
                              >
                                {activePopup.description}
                              </DialogDescription>
                            </DialogHeader>
                            <Button 
                                asChild 
                                size="lg" 
                                className="w-full sm:w-auto" 
                                onClick={() => setIsOpen(false)}
                                style={{ 
                                    backgroundColor: activePopup.ctaBackgroundColor || 'hsl(var(--primary))',
                                    color: activePopup.ctaTextColor || 'hsl(var(--primary-foreground))'
                                }}
                            >
                                <Link href={activePopup.ctaLink}>{activePopup.ctaText}</Link>
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }
    
    const renderBanner = () => {
        if (!activeBanner) return null;
        return (
            <div 
                id="promo-banner" 
                style={{
                    backgroundColor: activeBanner.backgroundColor || 'hsl(var(--primary))',
                    color: activeBanner.descriptionColor || 'hsl(var(--primary-foreground))',
                }} 
                className="relative px-4 py-3 sm:px-6 lg:px-8"
            >
                <div className="container mx-auto max-w-7xl flex items-center justify-center text-center">
                    <p className="text-sm font-medium">
                        <span style={{ color: activeBanner.titleColor || 'inherit' }} className="font-bold">{activeBanner.title}</span>
                        <span className="mx-2">-</span>
                        {activeBanner.description}
                        <Link 
                            href={activeBanner.ctaLink} 
                            style={{ 
                                color: activeBanner.ctaTextColor || 'inherit', 
                                backgroundColor: activeBanner.ctaBackgroundColor || 'transparent' 
                            }} 
                            className="font-bold underline hover:opacity-80 transition-opacity px-2 py-1 rounded-md ml-2"
                        >
                            {activeBanner.ctaText}
                        </Link>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <>
            {renderBanner()}
            {renderPopup()}
        </>
    );
}
