import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import imageCompression from 'browser-image-compression';

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

export const getStatusVariant = (status: string) => {
    switch (status) {
        case 'Delivered': return 'default';
        case 'In Production':
        case 'Ready for Dispatch': return 'secondary';
        case 'Awaiting Pay': return 'outline';
        default: return 'secondary';
    }
};

/**
 * Compresses an image file in the browser before uploading.
 * @param {File} file The image file to compress.
 * @param {number} maxSizeMB The maximum file size in megabytes.
 * @param {number} maxWidthOrHeight The maximum width or height of the image.
 * @returns {Promise<File>} The compressed image file.
 */
export async function compressImage(file: File, maxSizeMB: number = 2, maxWidthOrHeight: number = 1920): Promise<File> {
  const options = {
    maxSizeMB,
    maxWidthOrHeight,
    useWebWorker: true,
  };

  try {
    const compressedFile = await imageCompression(file, options);
    console.log(`Compressed ${file.name} from ${file.size / 1024 / 1024}MB to ${compressedFile.size / 1024 / 1024}MB`);
    return compressedFile;
  } catch (error) {
    console.error('Image compression failed:', error);
    // If compression fails, return the original file to not break the upload process
    return file;
  }
}
