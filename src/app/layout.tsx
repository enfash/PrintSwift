import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import MainLayout from '@/components/layout/main-layout';
import { CartProvider } from '@/context/cart-context';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  weight: ['700', '800'],
  variable: '--font-plus-jakarta-sans',
});

export const metadata: Metadata = {
  title: {
    default: 'BOMedia | Custom Printing & Branded Packaging in Nigeria',
    template: `%s | BOMedia`,
  },
  description: 'Affordable Custom Branding, Delivered Fast. High-quality business cards, custom mugs, branded boxes, and more in Lagos, Nigeria.',
  icons: {
    icon: '/favicon.png',
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${plusJakartaSans.variable}`}>
      <head />
      <body className={cn('font-sans antialiased')}>
        <FirebaseClientProvider>
          <CartProvider>
            <MainLayout>{children}</MainLayout>
          </CartProvider>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
