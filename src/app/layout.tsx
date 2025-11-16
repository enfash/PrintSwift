import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import MainLayout from '@/components/layout/main-layout';
import { CartProvider } from '@/context/cart-context';
import { getDoc, doc } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

// This function is defined here because it needs to be an async function
// at the top level of a Server Component to generate metadata.
// It cannot be in a 'use client' component.
export async function generateMetadata(): Promise<Metadata> {
  try {
    // Initialize a server-side instance of Firestore to fetch settings.
    // This is safe to do in Server Components.
    const { firestore } = initializeFirebase();
    const settingsDocRef = doc(firestore, 'settings', 'global');
    const settingsDoc = await getDoc(settingsDocRef);

    if (settingsDoc.exists()) {
      const settings = settingsDoc.data();
      return {
        title: {
          default: settings.seoTitle || 'BOMedia',
          template: `%s | ${settings.seoTitle || 'BOMedia'}`,
        },
        description: settings.seoDescription || 'Affordable Custom Branding, Delivered Fast.',
      };
    }
  } catch (error) {
    console.error("Failed to fetch settings for metadata:", error);
    // Fallback metadata if Firestore fetch fails
    return {
      title: 'BOMedia',
      description: 'Affordable Custom Branding, Delivered Fast.',
    };
  }

  // Default fallback
  return {
    title: 'BOMedia',
    description: 'Affordable Custom Branding, Delivered Fast.',
  };
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@700;800&display=swap" rel="stylesheet" />
      </head>
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
