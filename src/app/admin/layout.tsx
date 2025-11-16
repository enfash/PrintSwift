import React from 'react';
import '../globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import AdminApp from './_components/admin-app';
import { FirebaseClientProvider } from '@/firebase';

export const metadata = {
  title: 'Admin - BOMedia',
  description: 'Admin dashboard for BOMedia',
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={cn('font-body antialiased')}>
      <FirebaseClientProvider>
        <AdminApp>{children}</AdminApp>
      </FirebaseClientProvider>
      <Toaster />
    </div>
  );
}
