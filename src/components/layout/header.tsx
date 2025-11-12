
'use client';

import Link from 'next/link';
import { Menu, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Logo } from '@/components/logo';
import React from 'react';

const navLinks = [
  { href: '/products', label: 'Products' },
  { href: '/design-options', label: 'Design Options' },
  { href: '/contact', label: 'Contact' },
];

export function Header() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-7xl items-center">
        <div className="flex-1 flex items-center justify-start">
          <Link href="/" className="flex items-center space-x-2">
            <Logo />
            <span className="hidden font-bold font-headline sm:inline-block">PrintSwift</span>
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
          <Button variant="ghost" asChild className="hidden lg:flex items-center space-x-2">
            <a href="tel:+2348022247567">
              <Phone className="h-4 w-4" />
              <span>+234 802 224 7567</span>
            </a>
          </Button>
          <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Link href="/quote">Request a Quote</Link>
          </Button>

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
                    <span className="font-bold font-headline">PrintSwift</span>
                  </Link>
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
