
'use client';

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
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Mail, MapPin, LoaderCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  subject: z.string().min(5, { message: 'Subject must be at least 5 characters.' }),
  message: z.string().min(10, { message: 'Message must be at least 10 characters.' }),
});

export default function ContactPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log(values);
    setIsSubmitting(false);
    form.reset();
    toast({
      title: 'Message Sent!',
      description: "Thanks for reaching out. We'll get back to you shortly.",
    });
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-16 md:py-24">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-heading">Contact Us</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
          Have a question or want to discuss a project? Fill out the form below or reach out to us directly. We're here to help!
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-12">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Send us a Message</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input placeholder="john.doe@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Question about bulk orders" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us more about your inquiry..."
                            className="min-h-[150px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                    {isSubmitting ? (
                        <>
                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                        </>
                    ) : (
                        'Send Message'
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Our Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-muted-foreground">
                <div className="flex items-start space-x-4">
                    <div className="mt-1">
                        <MapPin className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground">Address</h3>
                        <p>123 Printing Lane, Ikeja,</p>
                        <p>Lagos, Nigeria</p>
                    </div>
                </div>
                <div className="flex items-start space-x-4">
                    <div className="mt-1">
                        <Phone className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground">Phone</h3>
                        <a href="tel:+2348022247567" className="hover:text-accent">+234 802 224 7567</a>
                    </div>
                </div>
                <div className="flex items-start space-x-4">
                    <div className="mt-1">
                        <Mail className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground">Email</h3>
                        <a href="mailto:info@bomedia.com" className="hover:text-accent">info@bomedia.com</a>
                    </div>
                </div>
                 <div className="pt-6">
                    <h3 className="font-semibold text-foreground mb-2">Business Hours</h3>
                    <p>Monday - Friday: 9:00 AM - 5:00 PM</p>
                    <p>Saturday: 10:00 AM - 2:00 PM</p>
                    <p>Sunday: Closed</p>
                 </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
