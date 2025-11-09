import React from 'react';
import '../globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import AdminApp from './_components/admin-app';

export const metadata = {
  title: 'Admin - PrintSwift',
  description: 'Admin dashboard for PrintSwift',
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={cn('font-body antialiased')}>
      <AdminApp>{children}</AdminApp>
      <Toaster />
    </div>
  );
}
