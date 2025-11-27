import { initializeFirebase } from '@/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

const URL = 'https://bomedia.com.ng';

async function generateSitemap() {
  const { firestore } = initializeFirebase();

  // Fetch all published products
  const productsQuery = query(collection(firestore, 'products'), where('status', '==', 'Published'));
  const productsSnapshot = await getDocs(productsQuery);
  const productUrls = productsSnapshot.docs.map((doc) => {
    const data = doc.data();
    return `
      <url>
        <loc>${URL}/products/${data.slug}</loc>
        <lastmod>${data.updatedAt?.toDate().toISOString() || new Date().toISOString()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
      </url>
    `;
  }).join('');

  // Fetch all product categories
  const categoriesQuery = query(collection(firestore, 'product_categories'));
  const categoriesSnapshot = await getDocs(categoriesQuery);
  const categoryUrls = categoriesSnapshot.docs.map((doc) => {
    const data = doc.data();
    return `
      <url>
        <loc>${URL}/products?category=${data.id}</loc>
        <lastmod>${data.updatedAt?.toDate().toISOString() || new Date().toISOString()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.6</priority>
      </url>
    `;
  }).join('');

  // Static pages
  const staticPages = [
    { loc: '', priority: '1.0', changefreq: 'daily' },
    { loc: '/products', priority: '0.9', changefreq: 'daily' },
    { loc: '/about', priority: '0.7', changefreq: 'monthly' },
    { loc: '/contact', priority: '0.7', changefreq: 'monthly' },
    { loc: '/faq', priority: '0.7', changefreq: 'monthly' },
    { loc: '/quote', priority: '0.7', changefreq: 'monthly' },
  ];

  const staticUrls = staticPages.map(page => `
    <url>
      <loc>${URL}${page.loc}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>${page.changefreq}</changefreq>
      <priority>${page.priority}</priority>
    </url>
  `).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${staticUrls}
      ${productUrls}
      ${categoryUrls}
    </urlset>
  `;
}

export async function GET() {
  const sitemap = await generateSitemap();

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
