import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getSafeImageUrl(url: string | undefined | null, seed?: string): string {
  const fallbackUrl = `https://placehold.co/600x400/e2e8f0/e2e8f0`;

  if (!url || url.trim() === '') {
    return fallbackUrl;
  }
  
  try {
    // This will throw an error for invalid URLs, including relative paths
    new URL(url);
    if (url.startsWith('http')) {
      return url;
    }
    return fallbackUrl;
  } catch (error) {
    return fallbackUrl;
  }
}

export function generateSearchTerms(
  name: string,
  slug: string,
  tags: string[] = [],
  categoryName: string = '',
  keywords: string[] = [],
  description: string = ''
): string[] {
  const allText = [name, slug, categoryName, description, ...tags, ...keywords].join(' ');
  const tokens = allText
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ') // Remove special characters
    .split(/\s+/) // Split by whitespace
    .filter(Boolean); // Remove empty strings

  // Return a unique set of tokens
  return Array.from(new Set(tokens));
}
