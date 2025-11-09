'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { LoaderCircle } from 'lucide-react';

export default function AdminRootPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading) {
      if (user) {
        router.replace('/admin/dashboard');
      } else {
        router.replace('/admin/login');
      }
    }
  }, [user, isUserLoading, router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <LoaderCircle className="h-8 w-8 animate-spin" />
    </div>
  );
}
