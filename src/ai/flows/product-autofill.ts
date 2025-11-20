
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


const structuredDataPrompt = ai.definePrompt({
  name: 'productStructuredDataPrompt',
  input: {schema: ProductAutofillInputSchema},
  output: {
    schema: ProductAutofillOutputSchema.omit({ longDescription: true })
  },
  prompt: `You are an expert e-commerce copywriter for a print shop in Lagos, Nigeria called BOMedia. Your task is to generate marketing content for a new product based on its name.

The output MUST be a valid JSON object.

Product Name: "{{productName}}"

Generate the following fields, but OMIT the "longDescription" field:

1.  **description**:
    A concise, engaging 1-sentence summary suitable for a product card.

2.  **subcategory**: A descriptive subcategory, like 'Premium' or 'Eco-Friendly'.

3.  **seo.title**: An SEO-friendly title, under 60 characters, including the product name and relevant keywords like "printing" or "Lagos".

4.  **seo.description**: A compelling meta description, under 160 characters, that encourages clicks from search engine results.

5.  **tags**: An array of 5-7 relevant, lowercase, single-word or hyphenated-word tags for filtering and search (e.g., "business-cards", "matte-finish", "corporate-branding").

6.  **keywords**: An array of 5-7 relevant, lowercase, single-word or hyphenated-word keywords for search.`,
});

const longDescriptionPrompt = ai.definePrompt({
    name: 'productLongDescriptionPrompt',
    input: { schema: z.object({ productName: z.string(), productDetails: z.string() }) },
    prompt: `Generate a premium, well-structured Markdown long description for this product. Follow these rules strictly:

1. **Use proper Markdown formatting.**
2. **Insert one blank line after every heading. No exceptions.**
3. **Break text into short paragraphs for readability (2–4 lines max).**
4. **Include clear, bold section headings** such as:

   * Overview
   * Benefits
   * Features
   * Specifications
5. **Use bullet points** where they improve clarity.
6. **If needed, include a specifications table** (2 columns, neat Markdown layout).
7. **Do not merge headings and paragraphs into one block.**
8. **Do not remove spacing between sections.**
9. Keep the tone: premium, concise, informative, and suitable for a printing company website.

**Input:**
`+"`{{productName}}`"+` – Description: `+"`{{productDetails}}`"+`

**Output:**
A fully formatted Markdown long description only — no extra commentary.`,
});


const productAutofillFlow = ai.defineFlow(
  {
    name: 'productAutofillFlow',
    inputSchema: ProductAutofillInputSchema,
    outputSchema: ProductAutofillOutputSchema,
  },
  async (input) => {
    
    // Step 1: Generate all structured data except for the long description
    const structuredDataResponse = await structuredDataPrompt(input);
    const structuredData = structuredDataResponse.output;

    if (!structuredData) {
        throw new Error('Failed to generate structured product data.');
    }
    
    // Step 2: Generate the long description separately using the strict prompt
    const longDescriptionResponse = await longDescriptionPrompt({
        productName: input.productName,
        productDetails: structuredData.description, // Use the short description as context
    });
    
    const longDescription = longDescriptionResponse.text;
    
    // Step 3: Combine the results
    return {
        ...structuredData,
        longDescription,
    };
  }
);
