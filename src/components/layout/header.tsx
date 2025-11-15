
'use client';

import Link from 'next/link';
import { Menu, Phone, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Logo } from '@/components/logo';
import React from 'react';
import { SearchBar } from '@/components/search-bar';
import { useCart } from '@/context/cart-context';

const navLinks = [
  { href: '/products', label: 'Products' },
  { href: '/tracking', label: 'Tracking' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
];

function CartButton() {
    const { items } = useCart();
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <Button asChild variant="ghost" size="icon">
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

export function Header() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-7xl items-center gap-4">
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Logo />
            <span className="hidden font-headline font-bold sm:inline-block">BOMedia</span>
          </Link>
        </div>

        <nav className="hidden md:flex flex-1 items-center justify-center">
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

        <div className="flex flex-1 items-center justify-end space-x-2 sm:space-x-4">
            <div className="w-full max-w-sm lg:max-w-xs hidden md:block">
                <SearchBar />
            </div>
            
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
                    <Logo />
                    <span className="font-headline font-bold">BOMedia</span>
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
