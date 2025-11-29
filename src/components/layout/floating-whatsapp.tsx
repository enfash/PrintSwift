
'use client';

import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

function WhatsAppIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
        </svg>
    );
}

export default function FloatingWhatsApp() {
  const firestore = useFirestore();
  const settingsDocRef = useMemoFirebase(
      () => (firestore ? doc(firestore, 'settings', 'global') : null),
      [firestore]
  );
  const { data: settings, isLoading } = useDoc<any>(settingsDocRef);

  if (isLoading) {
    return <Skeleton className="fixed bottom-6 right-6 h-14 w-14 rounded-full" />;
  }

  if (!settings?.whatsapp) {
    return null;
  }

  return (
    <Link
      href={settings.whatsapp}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className={cn(
        "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110",
        "animate-in fade-in zoom-in"
      )}
    >
      <WhatsAppIcon className="h-7 w-7" />
    </Link>
  );
}
