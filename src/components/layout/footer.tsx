
'use client';

import Link from 'next/link';
import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';
import { Logo } from '@/components/logo';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

export function Footer() {
  const firestore = useFirestore();
  const settingsDocRef = useMemoFirebase(
      () => (firestore ? doc(firestore, 'settings', 'global') : null),
      [firestore]
  );
  const { data: settings, isLoading } = useDoc<any>(settingsDocRef);
  
  return (
    <footer className="bg-card border-t">
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center space-x-3 mb-4">
              <Logo className="h-10 w-auto" />
            </Link>
            <p className="text-muted-foreground max-w-xs">
              Affordable custom branding, delivered fast. Your trusted partner for all printing needs.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4 font-heading">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/products" className="text-muted-foreground hover:text-foreground">All Products</Link></li>
              <li><Link href="/about" className="text-muted-foreground hover:text-foreground">About Us</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-foreground">Contact</Link></li>
              <li><Link href="/quote" className="text-muted-foreground hover:text-foreground">Get a Quote</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 font-heading">Categories</h3>
            <ul className="space-y-2">
              <li><Link href="/products" className="text-muted-foreground hover:text-foreground">Marketing Prints</Link></li>
              <li><Link href="/products" className="text-muted-foreground hover:text-foreground">Packaging</Link></li>
              <li><Link href="/products" className="text-muted-foreground hover:text-foreground">Apparel</Link></li>
              <li><Link href="/products" className="text-muted-foreground hover:text-foreground">Corporate Gifts</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 font-heading">Connect With Us</h3>
             {isLoading ? (
                <div className="space-y-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-2/3" />
                </div>
             ) : (
                <address className="space-y-3 not-italic">
                    {settings?.address && <p className="text-muted-foreground">{settings.address}</p>}
                    {settings?.phone && <p><a href={`tel:${settings.phone}`} className="text-muted-foreground hover:text-foreground">{settings.phone}</a></p>}
                    {settings?.email && <p><a href={`mailto:${settings.email}`} className="text-muted-foreground hover:text-foreground">{settings.email}</a></p>}
                </address>
             )}
            <div className="flex space-x-4 mt-4">
              {isLoading ? (
                <div className="flex space-x-4">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <Skeleton className="h-5 w-5 rounded-full" />
                </div>
              ) : (
                <>
                    {settings?.facebook && <a href={settings.facebook} aria-label="Facebook" className="text-muted-foreground hover:text-foreground"><Facebook className="h-5 w-5" /></a>}
                    {settings?.instagram && <a href={settings.instagram} aria-label="Instagram" className="text-muted-foreground hover:text-foreground"><Instagram className="h-5 w-5" /></a>}
                    {settings?.whatsapp && <a href={settings.whatsapp} aria-label="WhatsApp" className="text-muted-foreground hover:text-foreground"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg></a>}
                </>
              )}
            </div>
          </div>
        </div>
        <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
          <div>
            <span>&copy; {new Date().getFullYear()} </span>
            {isLoading ? <Skeleton className="h-4 w-24 inline-block" /> : <span>{settings?.businessName || 'BOMedia'}.</span>}
            <span> All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
