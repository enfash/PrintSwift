
import { NextRequest, NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase';
import { collection, query, where, getDocs, limit, Firestore } from 'firebase/firestore';

// Cached instances
let firestore: Firestore;

function ensureFirebaseInitialized() {
  if (!firestore) {
    firestore = initializeFirebase().firestore;
  }
}


/**
 * Normalizes and cleans up a search query string.
 * @param {string | null} q The raw query string.
 * @returns {string} The normalized query string.
 */
function normalize(q?: string | null): string {
  return (q || '').trim().toLowerCase();
}

/**
 * A simple scoring helper to rank documents based on relevance.
 * @param doc The product document from Firestore.
 * @param q The normalized search query.
 * @returns {number} The calculated score for the document.
 */
function scoreDoc(doc: any, q: string): number {
  if (!q) return 0;
  let score = 0;
  const name = (doc.name || '').toLowerCase();
  const keywords = (doc.keywords || []).map((k: string) => k.toLowerCase());
  
  // Highest score for exact keyword match
  if (keywords.includes(q)) {
    score += 100;
  }
  
  // High score for name prefix match
  if (name.startsWith(q)) {
    score += 50;
  }

  // Medium score for being a featured product
  if (doc.featured) {
    score += 20;
  }

  // Lower score for partial name match
  if (name.includes(q)) {
    score += 10;
  }

  return score;
}

export async function GET(request: NextRequest) {
  try {
    ensureFirebaseInitialized();

    const { searchParams } = new URL(request.url);
    const q = normalize(searchParams.get('q'));
    const category = searchParams.get('category') || '';
    const perPage = Math.min(100, Number(searchParams.get('perPage') || 20));

    const productsRef = collection(firestore, 'products');

    // If there's no query, return a default list of featured/recent products
    if (!q) {
      let baseQuery = query(productsRef, where('status', '==', 'Published'));
      if (category) {
        baseQuery = query(baseQuery, where('categoryId', '==', category));
      }
      const finalQuery = query(baseQuery, where('featured', '==', true), limit(perPage));
      const snapshot = await getDocs(finalQuery);
      const products = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      return NextResponse.json({ results: products, total: products.length });
    }

    // --- Multi-Query Search Strategy ---
    const promises: Promise<any[]>[] = [];
    const productsBaseQuery = query(productsRef, where('status', '==', 'Published'));

    // 1. Exact match on admin-curated keywords (highest priority)
    promises.push(
      getDocs(query(productsBaseQuery, where('keywords', 'array-contains', q)))
        .then(s => s.docs.map(d => ({ id: d.id, ...d.data() })))
    );

    // 2. "array-contains-any" for broader token matching in searchTerms
    const tokens = q.split(/\s+/).filter(Boolean).slice(0, 10); // Limit to 10 tokens for performance
    if (tokens.length > 0) {
      promises.push(
        getDocs(query(productsBaseQuery, where('searchTerms', 'array-contains-any', tokens), limit(50)))
          .then(s => s.docs.map(d => ({ id: d.id, ...d.data() })))
      );
    }
    
    // 3. Name prefix match (using >= and < trick)
    // The '\uf8ff' is a high-codepoint character that acts as a ceiling for string ranges.
    promises.push(
      getDocs(query(productsBaseQuery, where('name_lower', '>=', q), where('name_lower', '<=', q + '\uf8ff'), limit(50)))
        .then(s => s.docs.map(d => ({ id: d.id, ...d.data() })))
    );

    // --- Merge, Score, and Sort Results ---
    const resultsArrays = await Promise.all(promises);
    const merged = new Map<string, any>();
    
    // Flatten results and add to map, preventing duplicates
    resultsArrays.flat().forEach(product => {
      if (product && !merged.has(product.id)) {
        merged.set(product.id, product);
      }
    });

    const mergedArr = Array.from(merged.values());

    // Filter by category if one was provided
    const filtered = category 
      ? mergedArr.filter(p => p.categoryId === category) 
      : mergedArr;

    // Score and sort the final results
    const scored = filtered.map(p => ({ ...p, _score: scoreDoc(p, q) }));
    scored.sort((a, b) => b._score - a._score);
    
    // Paginate the final list
    const total = scored.length;
    const paged = scored.slice(0, perPage);

    return NextResponse.json({ results: paged, total });

  } catch (err: any) {
    console.error('Search API Error:', err);
    return NextResponse.json({ error: 'Search failed', details: err.message }, { status: 500 });
  }
}
