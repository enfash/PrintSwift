'use server';

/**
 * @fileOverview This file defines a Genkit flow for searching design options using natural language.
 *
 * The flow takes a natural language query as input and returns a list of design options that match the query.
 * It exports:
 *   - designOptionSearch: The main function to perform the search.
 *   - DesignOptionSearchInput: The input type for the search query.
 *   - DesignOptionSearchOutput: The output type for the search results.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DesignOptionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  imageUrl: z.string().optional(),
});

export type DesignOption = z.infer<typeof DesignOptionSchema>;

const DesignOptionSearchInputSchema = z.object({
  query: z.string().describe('The natural language query to search for design options.'),
});
export type DesignOptionSearchInput = z.infer<typeof DesignOptionSearchInputSchema>;

const DesignOptionSearchOutputSchema = z.array(DesignOptionSchema);
export type DesignOptionSearchOutput = z.infer<typeof DesignOptionSearchOutputSchema>;

export async function designOptionSearch(input: DesignOptionSearchInput): Promise<DesignOptionSearchOutput> {
  return designOptionSearchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'designOptionSearchPrompt',
  input: {schema: DesignOptionSearchInputSchema},
  output: {schema: DesignOptionSearchOutputSchema},
  prompt: `You are a design assistant helping users find relevant design options.
  Based on the user's query, return a list of design options that match the query.
  The design options should be relevant and helpful to the user.

  User Query: {{{query}}}
  `,
});

const designOptionSearchFlow = ai.defineFlow(
  {
    name: 'designOptionSearchFlow',
    inputSchema: DesignOptionSearchInputSchema,
    outputSchema: DesignOptionSearchOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
