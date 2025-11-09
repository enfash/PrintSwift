import Link from 'next/link';
import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';
import { Logo } from '@/components/logo';

export function Footer() {
  return (
    <footer className="bg-card border-t">
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center space-x-3 mb-4">
              <Logo />
              <span className="text-xl font-headline font-bold">PrintSwift</span>
            </Link>
            <p className="text-muted-foreground max-w-xs">
              Affordable custom branding, delivered fast. Your trusted partner for all printing needs.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4 font-headline">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/products" className="text-muted-foreground hover:text-foreground">All Products</Link></li>
              <li><Link href="/about" className="text-muted-foreground hover:text-foreground">About Us</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-foreground">Contact</Link></li>
              <li><Link href="/quote" className="text-muted-foreground hover:text-foreground">Get a Quote</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 font-headline">Categories</h3>
            <ul className="space-y-2">
              <li><Link href="/products" className="text-muted-foreground hover:text-foreground">Marketing Prints</Link></li>
              <li><Link href="/products" className="text-muted-foreground hover:text-foreground">Packaging</Link></li>
              <li><Link href="/products" className="text-muted-foreground hover:text-foreground">Apparel</Link></li>
              <li><Link href="/products" className="text-muted-foreground hover:text-foreground">Corporate Gifts</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 font-headline">Connect With Us</h3>
            <address className="space-y-3 not-italic">
              <p className="text-muted-foreground">Lagos, Nigeria</p>
              <p>
                <a href="tel:+2348022247567" className="text-muted-foreground hover:text-foreground">+234 802 224 7567</a>
              </p>
              <p>
                <a href="mailto:info@printswift.com" className="text-muted-foreground hover:text-foreground">info@printswift.com</a>
              </p>
            </address>
            <div className="flex space-x-4 mt-4">
              <a href="#" aria-label="Facebook" className="text-muted-foreground hover:text-foreground"><Facebook className="h-5 w-5" /></a>
              <a href="#" aria-label="Instagram" className="text-muted-foreground hover:text-foreground"><Instagram className="h-5 w-5" /></a>
              <a href="#" aria-label="Twitter" className="text-muted-foreground hover:text-foreground"><Twitter className="h-5 w-5" /></a>
              <a href="#" aria-label="LinkedIn" className="text-muted-foreground hover:text-foreground"><Linkedin className="h-5 w-5" /></a>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} PrintSwift. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
