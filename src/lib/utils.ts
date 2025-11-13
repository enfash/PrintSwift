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
