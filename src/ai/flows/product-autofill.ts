
'use server';
/**
 * @fileOverview A Genkit flow for automatically generating product marketing content.
 *
 * This flow takes a product name and generates descriptions, SEO metadata, and tags.
 *
 * - productAutofill: The main function to trigger the content generation.
 * - ProductAutofillInput: The input type (product name).
 * - ProductAutofillOutput: The output type (generated content).
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProductAutofillInputSchema = z.object({
  productName: z.string().describe('The name of the product to generate content for.'),
});
export type ProductAutofillInput = z.infer<typeof ProductAutofillInputSchema>;

const ProductAutofillOutputSchema = z.object({
  description: z.string().describe('A concise, one-sentence summary for a product card.'),
  longDescription: z.string().describe('A detailed, Markdown-formatted description for the product page.'),
  subcategory: z.string().describe("A descriptive subcategory, like 'Premium' or 'Eco-Friendly'."),
  seo: z.object({
    title: z.string().describe('An SEO-friendly title, under 60 characters.'),
    description: z.string().describe('A compelling meta description, under 160 characters.'),
  }),
  tags: z.array(z.string()).describe('An array of 5-7 relevant, lowercase tags for filtering.'),
  keywords: z.array(z.string()).describe('An array of 5-7 relevant, lowercase keywords for search.'),
});
export type ProductAutofillOutput = z.infer<typeof ProductAutofillOutputSchema>;


export async function productAutofill(input: ProductAutofillInput): Promise<ProductAutofillOutput> {
  return productAutofillFlow(input);
}


const prompt = ai.definePrompt({
  name: 'productAutofillPrompt',
  input: {schema: ProductAutofillInputSchema},
  output: {schema: ProductAutofillOutputSchema},
  prompt: `You are an expert e-commerce copywriter for a print shop in Lagos, Nigeria called BOMedia. Your task is to generate compelling marketing content for a new product based on its name.

The output MUST be a valid JSON object.

Product Name: "{{productName}}"

Generate the following fields:
- description: A concise and appealing one-sentence summary for a product card.
- longDescription: A detailed, paragraph-based description for the main product page. Use Markdown for formatting (e.g., **bold**, *italics*, and lists with - or *).
- subcategory: A descriptive subcategory, like 'Premium' or 'Eco-Friendly'.
- seo.title: An SEO-friendly title, under 60 characters, including the product name and relevant keywords like "printing" or "Lagos".
- seo.description: A compelling meta description, under 160 characters, that encourages clicks from search engine results.
- tags: An array of 5-7 relevant, lowercase, single-word or hyphenated-word tags for filtering and search (e.g., "business-cards", "matte-finish", "corporate-branding").
- keywords: An array of 5-7 relevant, lowercase, single-word or hyphenated-word keywords for search.`,
});


const productAutofillFlow = ai.defineFlow(
  {
    name: 'productAutofillFlow',
    inputSchema: ProductAutofillInputSchema,
    outputSchema: ProductAutofillOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
