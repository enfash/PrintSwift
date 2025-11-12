import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getSafeImageUrl(url: string | undefined | null, seed?: string): string {
  // Use a single, static, neutral placeholder for any invalid or missing URL.
  const fallbackUrl = `https://placehold.co/600x400/e2e8f0/e2e8f0`;
  
  if (!url) {
    return fallbackUrl;
  }
  
  try {
    // Check for gs:// URLs and treat them as invalid for direct use.
    if (url.startsWith('gs://')) {
      return fallbackUrl;
    }
    
    // Validate if the URL is a proper HTTP/HTTPS URL.
    new URL(url);
    if (url.startsWith('http')) {
      return url;
    }
    
    return fallbackUrl;
  } catch (error) {
    // This catches invalid URL formats.
    return fallbackUrl;
  }
}
