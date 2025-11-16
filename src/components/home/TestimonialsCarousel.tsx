
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { useInterval } from '@/hooks/use-interval';

function StarRating({ rating, className }: { rating: number, className?: string }) {
    return (
        <div className={cn("flex items-center", className)}>
            {[...Array(5)].map((_, i) => (
                <Star
                    key={i}
                    className={`h-5 w-5 ${i < rating ? 'text-accent fill-accent' : 'text-muted-foreground/30'}`}
                />
            ))}
        </div>
    );
}

const TestimonialSkeleton = () => (
    <Card className="flex flex-col text-center">
        <CardContent className="pt-6 flex-grow flex flex-col items-center">
            <Skeleton className="w-20 h-20 rounded-full mb-4" />
            <Skeleton className="h-5 w-24 mb-2" />
            <Skeleton className="h-4 w-32 mb-4" />
            <div className="flex space-x-1 mb-4">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-5 w-5" />
            </div>
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-5/6" />
        </CardContent>
    </Card>
);

export default function TestimonialsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const firestore = useFirestore();

  const testimonialsRef = useMemoFirebase(
    () => firestore 
      ? query(
          collection(firestore, 'testimonials'), 
          where('visible', '==', true), 
          limit(5)
        ) 
      : null,
    [firestore]
  );
  const { data: testimonials, isLoading } = useCollection<any>(testimonialsRef);

  useInterval(() => {
    if (testimonials && testimonials.length > 0) {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }
  }, isPlaying ? 6000 : null);
  
  if (isLoading) {
    return (
        <section className="py-16 md:py-24 bg-muted">
            <div className="container mx-auto max-w-7xl px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold font-heading">What Our Clients Say</h2>
                    <p className="mt-3 text-lg text-muted-foreground">We're trusted by businesses across Nigeria</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {Array.from({ length: 3 }).map((_, i) => <TestimonialSkeleton key={i} />)}
                </div>
            </div>
        </section>
    );
  }

  if (!testimonials || testimonials.length === 0) {
    return null; // Don't render the section if there are no testimonials
  }

  const currentTestimonial = testimonials[currentIndex];
  
  return (
    <section 
        className="py-12 sm:py-16 bg-muted"
        onMouseEnter={() => setIsPlaying(false)}
        onMouseLeave={() => setIsPlaying(true)}
    >
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-8 font-heading">What Our Clients Say</h2>
        
        <div className="relative" role="region" aria-roledescription="carousel" aria-label="Customer testimonials">
          <div className="overflow-hidden">
            <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                aria-live="polite"
            >
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="w-full flex-shrink-0">
                  <div className="mx-auto max-w-2xl">
                    <div className="pt-8">
                      <p className="text-lg text-foreground italic">"{testimonial.quote}"</p>
                      <div className="mt-6 flex items-center gap-4 justify-center">
                        <Avatar className="w-14 h-14">
                            <AvatarImage src={testimonial.imageUrl || ''} alt={testimonial.name} />
                            <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="text-left">
                          <div className="font-semibold text-base">{testimonial.name}</div>
                          {testimonial.company && <div className="text-sm text-muted-foreground">{testimonial.company}</div>}
                        </div>
                      </div>
                      {testimonial.rating && <StarRating rating={testimonial.rating} className="justify-center mt-4" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                aria-label={`Show testimonial ${i + 1}`}
                onClick={() => setCurrentIndex(i)}
                className={cn(
                  'w-2.5 h-2.5 rounded-full transition-colors',
                  i === currentIndex ? 'bg-primary' : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                )}
              />
            ))}
          </div>
      </div>
    </section>
  );
}
