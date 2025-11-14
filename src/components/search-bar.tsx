
'use client';

import React from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { useRouter } from 'next/navigation';
import { Search, LoaderCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { getSafeImageUrl } from '@/lib/utils';
import Image from 'next/image';

interface SearchResult {
    id: string;
    slug: string;
    name: string;
    categoryName?: string;
    imageUrls?: string[];
    mainImageIndex?: number;
    priceBase?: number;
}

export function SearchBar() {
  const [query, setQuery] = React.useState('');
  const [suggestions, setSuggestions] = React.useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const router = useRouter();

  React.useEffect(() => {
    if (!debouncedQuery) {
      setSuggestions([]);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}&perPage=6`)
      .then(r => r.json())
      .then(data => {
        if (!cancelled) {
          setSuggestions(data.results || []);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!query) return;
    router.push(`/products?search=${encodeURIComponent(query)}`);
  };
  
  const showSuggestions = isFocused && (suggestions.length > 0 || isLoading);

  return (
    <div className="relative">
      <form onSubmit={handleSearchSubmit}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          className="w-full rounded-md border pl-9"
          value={query}
          placeholder="Search products..."
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)} // Delay to allow click on suggestions
          aria-label="Search"
        />
      </form>
      {showSuggestions && (
        <div className="absolute mt-1 w-full bg-background shadow-lg rounded-md border z-50">
          {isLoading && !suggestions.length ? (
            <div className="p-4 flex items-center justify-center text-sm text-muted-foreground">
                <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                Searching...
            </div>
          ) : (
            <ul className="py-1">
                {suggestions.map((item) => {
                    const imageUrl = getSafeImageUrl(item.imageUrls?.[item.mainImageIndex || 0]);
                    return (
                        <li key={item.id}>
                            <a 
                                href={`/products/${item.slug}`} 
                                className="flex items-center gap-3 p-2 mx-1 rounded-md hover:bg-muted"
                            >
                                <Image 
                                    src={imageUrl} 
                                    alt={item.name} 
                                    width={40} 
                                    height={40}
                                    className="w-10 h-10 object-cover rounded"
                                />
                                <div className="flex-1">
                                    <div className="font-medium text-sm">{item.name}</div>
                                    <div className="text-xs text-muted-foreground">{item.categoryName}</div>
                                </div>
                            </a>
                        </li>
                    );
                })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
