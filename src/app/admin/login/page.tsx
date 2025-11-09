
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle } from 'lucide-react';
import { useUser } from '@/firebase';

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

// Dummy user state for local development/testing
const useDummyUser = () => {
    const [user, setUser] = useState<{ email: string } | null>(() => {
        if (typeof window !== 'undefined') {
            const storedUser = sessionStorage.getItem('dummyUser');
            return storedUser ? JSON.parse(storedUser) : null;
        }
        return null;
    });

    useEffect(() => {
        const handleStorageChange = () => {
            const storedUser = sessionStorage.getItem('dummyUser');
            setUser(storedUser ? JSON.parse(storedUser) : null);
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const login = (email: string) => {
        const dummyUser = { email };
        sessionStorage.setItem('dummyUser', JSON.stringify(dummyUser));
        setUser(dummyUser);
        // Dispatch a storage event to notify other tabs/windows
        window.dispatchEvent(new Event('storage'));
    };

    const logout = () => {
        sessionStorage.removeItem('dummyUser');
        setUser(null);
        window.dispatchEvent(new Event('storage'));
    };

    return { user, login, logout, isUserLoading: false };
};


export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, isUserLoading, login } = useDummyUser();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: 'admin@example.com', password: 'password' },
  });

  useEffect(() => {
    if (!isUserLoading && user) {
      router.replace('/admin/dashboard');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading) {
    return <div className="flex h-screen items-center justify-center"><LoaderCircle className="h-8 w-8 animate-spin" /></div>;
  }
   if (!isUserLoading && user) {
    // Already logged in, redirecting...
    return <div className="flex h-screen items-center justify-center"><LoaderCircle className="h-8 w-8 animate-spin" /></div>;
  }


  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    // Dummy login credentials
    const DUMMY_EMAIL = 'admin@example.com';
    const DUMMY_PASSWORD = 'password';

    if (values.email === DUMMY_EMAIL && values.password === DUMMY_PASSWORD) {
      toast({
        title: 'Login Successful',
        description: 'Redirecting to your dashboard...',
      });
      login(values.email);
      router.push('/admin/dashboard');
    } else {
      toast({
        variant: 'destructive',
        title: 'Authentication Failed',
        description: 'Invalid email or password.',
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">
            Admin Login
          </CardTitle>
          <CardDescription>
            Enter the credentials to access the dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="admin@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <p className="text-xs text-muted-foreground">
                Hint: Use `admin@example.com` and `password`.
              </p>
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? (
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Login
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

