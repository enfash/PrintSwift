'use client';

import { useFormState, useFormStatus } from 'react-dom';
import Image from 'next/image';
import { searchAction } from '@/app/design-options/actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Search, LoaderCircle, ServerCrash } from 'lucide-react';
import type { DesignOption } from '@/ai/flows/design-option-search';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useRef } from 'react';

const initialState = {
  message: null,
  results: null,
  timestamp: Date.now(),
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="bg-accent text-accent-foreground hover:bg-accent/90 shrink-0">
      {pending ? (
        <>
          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
          Searching...
        </>
      ) : (
        <>
          <Search className="mr-2 h-4 w-4" />
          Search
        </>
      )}
    </Button>
  );
}

function SearchResults({ results, message, hasError }: { results: DesignOption[] | null, message: string | null, hasError: boolean }) {
  const { pending } = useFormStatus();

  if (pending) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <Skeleton className="aspect-video w-full" />
            <CardContent className="pt-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6 mt-1" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  if (hasError) {
    return (
        <Alert variant="destructive" className="mt-8">
            <ServerCrash className="h-4 w-4" />
            <AlertTitle>Search Error</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
        </Alert>
    );
  }
  
  if (results && results.length === 0) {
      return (
        <div className="text-center py-16 bg-card rounded-lg border border-dashed">
            <Search className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No results found</h3>
            <p className="mt-1 text-sm text-muted-foreground">{message || "Try searching for something else like 'modern business cards' or 'nature logo'."}</p>
        </div>
      )
  }

  if (!results) {
      return (
        <div className="text-center py-16 bg-card rounded-lg border border-dashed">
            <Search className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">Find your design inspiration</h3>
            <p className="mt-1 text-sm text-muted-foreground">Use natural language to search for design options for your next project.</p>
        </div>
      );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {results.map((option) => (
        <Card key={option.id} className="overflow-hidden group">
          <div className="aspect-video relative overflow-hidden">
            <Image
              src={option.imageUrl || 'https://picsum.photos/seed/fallback/500/400'}
              alt={option.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              data-ai-hint="design concept"
            />
          </div>
          <CardContent className="p-4">
            <CardTitle className="text-lg font-semibold mb-2 line-clamp-1">{option.name}</CardTitle>
            <p className="text-sm text-muted-foreground line-clamp-2">{option.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function DesignOptionSearch() {
  const [state, formAction] = useFormState(searchAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  
  // Distinguish between validation errors and server errors for UI
  const hasServerError = state.message && !state.results;
  const hasValidationError = state.message && state.results === null;

  return (
    <div>
      <form ref={formRef} action={formAction} className="mb-12">
        <div className="flex w-full max-w-2xl mx-auto items-start space-x-2">
          <div className="flex-grow">
            <Input 
              type="search" 
              name="query"
              placeholder="e.g., 'A bold logo for a coffee shop'" 
              required 
              className="text-base h-12"
            />
            {hasValidationError && <p className="text-sm text-destructive mt-2">{state.message}</p>}
          </div>
          <SubmitButton />
        </div>
      </form>
      
      <div key={state.timestamp}>
        <SearchResults results={state.results} message={state.message} hasError={hasServerError} />
      </div>
    </div>
  );
}
