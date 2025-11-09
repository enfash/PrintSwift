
'use client';

import { useState } from 'react';
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
import { useAuth, useFirestore, setDocumentNonBlocking } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { doc } from 'firebase/firestore';

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});


export default function LoginPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const auth = useAuth();
  const firestore = useFirestore();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: 'admin@example.com', password: 'password' },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    if (!auth || !firestore) {
        toast({
            variant: 'destructive',
            title: 'Authentication Error',
            description: 'Firebase services are not initialized.',
        });
        setIsSubmitting(false);
        return;
    }
    
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      toast({
        title: 'Login Successful',
        description: 'Redirecting to your dashboard...',
      });
      // A redirect will happen via the useUser hook, so no need to setIsSubmitting(false)
    } catch (error) {
       // Catches both user not found and invalid credential, as Firebase behavior can vary.
       if (error instanceof FirebaseError && (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential')) {
        // If the user does not exist, and it's the default admin email, create the account.
        if (values.email === 'admin@example.com') {
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
                const user = userCredential.user;

                // Create the admin role document in Firestore to grant permissions.
                const adminRoleRef = doc(firestore, 'roles_admin', user.uid);
                setDocumentNonBlocking(adminRoleRef, {}, {});

                toast({
                    title: 'Admin Account Created',
                    description: 'Your admin account has been created. Logging you in...',
                });
                // Successful creation triggers onAuthStateChanged, leading to a redirect.
            } catch (creationError) {
                 toast({
                    variant: 'destructive',
                    title: 'Failed to Create Admin User',
                    description: 'Could not create the admin user account. Please check console for details.',
                });
                setIsSubmitting(false);
            }
        } else {
            // If it's not the admin email, just show the standard failure message.
            toast({
                variant: 'destructive',
                title: 'Authentication Failed',
                description: 'Invalid email or password provided.',
            });
            setIsSubmitting(false);
        }
       } else {
            // Handle other unexpected Firebase or network errors.
            console.error("Login error:", error);
            toast({
                variant: 'destructive',
                title: 'An Unexpected Error Occurred',
                description: 'Please try again later.',
            });
            setIsSubmitting(false);
       }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
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
