import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getSafeImageUrl(url: string | undefined | null, seed: string): string {
  const fallbackUrl = `https://picsum.photos/seed/${seed}/600/400`;
  
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
