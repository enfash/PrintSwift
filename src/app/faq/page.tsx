
'use client';

import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { LoaderCircle } from 'lucide-react';

export default function FAQPage() {
  const firestore = useFirestore();
  const faqsRef = useMemoFirebase(() => firestore ? collection(firestore, 'faqs') : null, [firestore]);
  const { data: faqs, isLoading } = useCollection<any>(faqsRef);
  
  const faqCategories = faqs
    ? [...new Set(faqs.map(faq => faq.category))].sort()
    : [];

  return (
    <div className="container mx-auto max-w-4xl px-4 py-16 md:py-24">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-headline">Frequently Asked Questions</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Find answers to common questions about our products, services, and processes.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center">
            <LoaderCircle className="h-8 w-8 animate-spin" />
        </div>
      ) : faqCategories.length > 0 ? (
        <div className="space-y-8">
            {faqCategories.map(category => (
                <Card key={category}>
                    <CardHeader>
                        <CardTitle>{category}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Accordion type="single" collapsible className="w-full">
                            {faqs.filter(faq => faq.category === category && faq.visible).map(faq => (
                                <AccordionItem value={faq.id} key={faq.id}>
                                    <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                                    <AccordionContent className="prose max-w-none text-muted-foreground">
                                        {faq.answer}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </CardContent>
                </Card>
            ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-card rounded-lg border border-dashed">
            <h3 className="text-lg font-medium">No FAQs yet</h3>
            <p className="text-sm text-muted-foreground">Check back later for answers to common questions.</p>
        </div>
      )}
    </div>
  );
}
