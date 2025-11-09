
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center space-y-6 text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
        <FileQuestion className="h-12 w-12 text-primary" />
      </div>
      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl">
          404 - Page Not Found
        </h1>
        <p className="max-w-[600px] text-muted-foreground md:text-xl">
          Oops! The page you're looking for doesn't exist. It might have been
          moved or deleted.
        </p>
      </div>
      <Button asChild>
        <Link href="/">Return to Homepage</Link>
      </Button>
    </div>
  );
}
