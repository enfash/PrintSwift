
'use client';

import Link from 'next/link';
import { Menu, Phone, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Logo } from '@/components/logo';
import React from 'react';
import { SearchBar } from '@/components/search-bar';
import { useCart } from '@/context/cart-context';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

const navLinks = [
  { href: '/products', label: 'Products' },
  { href: '/tracking', label: 'Tracking' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
];

function CartButton() {
    const { items } = useCart();
    const itemCount = items.length;

    return (
        <Button asChild variant="ghost" size="icon" className="relative">
            <Link href="/cart">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-accent-foreground text-xs">
                        {itemCount}
                    </span>
                )}
                <span className="sr-only">Shopping Cart</span>
            </Link>
        </Button>
    )
}

function HeaderPhone() {
    const firestore = useFirestore();
    const settingsDocRef = useMemoFirebase(
        () => (firestore ? doc(firestore, 'settings', 'global') : null),
        [firestore]
    );
    const { data: settings, isLoading } = useDoc<any>(settingsDocRef);

    if (isLoading) {
        return <Skeleton className="h-6 w-32" />;
    }

    if (!settings?.phone) {
        return null;
    }
    
    return (
        <a href={`tel:${settings.phone}`} className="hidden md:flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
            <Phone className="h-4 w-4 mr-2" />
            {settings.phone}
        </a>
    );
}

export function Header() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between gap-4 px-6">
        
        {/* Left Section */}
        <div className="flex items-center flex-1 justify-start">
          <Link href="/" className="flex items-center space-x-2">
            <Logo className="h-8 w-auto" />
          </Link>
        </div>

        {/* Center Section (Desktop) */}
        <nav className="hidden md:flex items-center justify-center">
          <div className="flex items-center space-x-6 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>

        {/* Right Section */}
        <div className="flex flex-1 items-center justify-end space-x-2 sm:space-x-4">
            <div className="w-full max-w-sm lg:max-w-[14rem] hidden md:block">
                <SearchBar />
            </div>

            <HeaderPhone />
            
            <CartButton />

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" className="md:hidden" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <div className="flex flex-col h-full">
                <div className="flex items-center mb-8">
                  <Link href="/" className="mr-6 flex items-center space-x-2" onClick={() => setIsOpen(false)}>
                    <Logo className="h-8 w-auto" />
                  </Link>
                </div>
                <div className="mb-6">
                    <SearchBar />
                </div>
                <div className="flex flex-col space-y-4 text-left">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="text-lg font-medium transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
                <div className="mt-auto flex flex-col space-y-4">
                  <Button asChild>
                    <a href="tel:+2348022247567" className="flex items-center justify-center space-x-2">
                      <Phone className="h-4 w-4" />
                      <span>Call +234 802 224 7567</span>
                    </a>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
