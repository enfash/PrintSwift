'use server';

import { designOptionSearch, type DesignOptionSearchInput, type DesignOptionSearchOutput } from '@/ai/flows/design-option-search';
import { z } from 'zod';

interface SearchState {
  message: string | null;
  results: DesignOptionSearchOutput | null;
  timestamp: number;
}

const SearchSchema = z.object({
  query: z.string().min(3, 'Query must be at least 3 characters long.'),
});

export async function searchAction(
  prevState: SearchState,
  formData: FormData
): Promise<SearchState> {
  const validatedFields = SearchSchema.safeParse({
    query: formData.get('query'),
  });

  if (!validatedFields.success) {
    return {
      message: validatedFields.error.flatten().fieldErrors.query?.[0] ?? 'Invalid query.',
      results: prevState.results, // Keep previous results on validation error
      timestamp: Date.now(),
    };
  }

  try {
    const searchInput: DesignOptionSearchInput = { query: validatedFields.data.query };
    const results = await designOptionSearch(searchInput);

    if (!results || results.length === 0) {
        return {
            message: "No design options found for your query. Try another search.",
            results: [],
            timestamp: Date.now(),
        }
    }

    // The AI might not return image URLs, so we add placeholders.
    const resultsWithImages = results.map((result, index) => ({
        ...result,
        imageUrl: result.imageUrl || `https://picsum.photos/seed/${result.id || index}/500/400`,
    }))

    return { message: null, results: resultsWithImages, timestamp: Date.now() };
  } catch (error) {
    console.error('AI Search Error:', error);
    return { message: 'An unexpected error occurred. Please try again later.', results: null, timestamp: Date.now() };
  }
}
