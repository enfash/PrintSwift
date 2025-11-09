
'use client';

import { useEffect } from 'react';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { LoaderCircle } from 'lucide-react';

export default function AdminCatchAllPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading) {
      if (user) {
        // If user is logged in, redirect to the admin dashboard
        router.replace('/admin/dashboard');
      } else {
        // If user is not logged in, redirect to the login page
        router.replace('/admin/login');
      }
    }
  }, [user, isUserLoading, router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
