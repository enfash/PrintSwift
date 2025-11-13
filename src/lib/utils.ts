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
    // Correctly handle gs:// URLs by converting them to public HTTPS URLs
    if (url.startsWith('gs://')) {
        const bucket = url.split('/')[2];
        const path = url.split('/').slice(3).join('/');
        return `https://storage.googleapis.com/${bucket}/${path}`;
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
