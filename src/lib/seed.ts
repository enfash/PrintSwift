
import { collection, writeBatch, doc } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';

// Sample data for product categories
const categories = [
  { id: 'marketing-prints', name: 'Marketing & Business Prints', description: 'Business cards, flyers, posters, and more.' },
  { id: 'large-format', name: 'Large Format & Outdoor', description: 'Banners, signs, and large displays.' },
  { id: 'packaging', name: 'Packaging Prints', description: 'Custom boxes, labels, and bags.' },
  { id: 'apparel', name: 'Apparel & Textile Printing', description: 'T-shirts, hoodies, and other custom apparel.' },
  { id: 'corporate-gifts', name: 'Corporate Gifts', description: 'Branded notebooks, pens, and other promotional items.' },
  { id: 'signage-display', name: 'Signage & Display Systems', description: 'Roll-up banners, A-frame signs, and more.' },
];

// Sample data for products
const products = [
  // Marketing & Business Prints
  { name: 'Business Cards', categoryId: 'marketing-prints', featured: true, pricing: { baseCost: 50, tax: 7.5, addons: [], tiers: [ { qty: 100, setup: 10, unitCost: 0.5, margin: 40 }, { qty: 500, setup: 10, unitCost: 0.4, margin: 45 }, { qty: 1000, setup: 10, unitCost: 0.3, margin: 50 } ] } },
  { name: 'A5 Flyers', categoryId: 'marketing-prints', featured: true },
  { name: 'Posters (A2/A3)', categoryId: 'marketing-prints' },
  { name: 'Presentation Folders', categoryId: 'marketing-prints' },
  { name: 'Letterheads & Envelopes', categoryId: 'marketing-prints' },
  // Large Format
  { name: 'Vinyl Banners', categoryId: 'large-format', featured: true },
  { name: 'Backdrop Banners', categoryId: 'large-format' },
  { name: 'Wall Murals / Wallpapers', categoryId: 'large-format' },
  { name: 'SAV Vinyl Stickers', categoryId: 'large-format' },
  // Packaging
  { name: 'Product Labels', categoryId: 'packaging' },
  { name: 'Paper Bags', categoryId: 'packaging' },
  { name: 'Food Boxes', categoryId: 'packaging', pricing: { baseCost: 20, tax: 7.5, addons: [], tiers: [ { qty: 250, setup: 15, unitCost: 0.8, margin: 35 }, { qty: 1000, setup: 15, unitCost: 0.6, margin: 40 } ] } },
  { name: 'Product Boxes', categoryId: 'packaging' },
  // Apparel
  { name: 'Custom T-Shirts', categoryId: 'apparel', featured: true },
  { name: 'Custom Hoodies', categoryId: 'apparel' },
  { name: 'Branded Polo Shirts', categoryId: 'apparel' },
  { name: 'Custom Caps', categoryId: 'apparel' },
  // Corporate Gifts
  { name: 'Branded Notebooks', categoryId: 'corporate-gifts' },
  { name: 'Promotional Pens', categoryId: 'corporate-gifts' },
  { name: 'ID Cards', categoryId: 'corporate-gifts' },
  // Signage & Display
  { name: 'Roll-up Banners', categoryId: 'signage-display' },
  { name: 'A-Frame Signs', categoryId: 'signage-display' },
  { name: 'Light Boxes', categoryId: 'signage-display' },
  { name: 'Acrylic Signs', categoryId: 'signage-display' },
];

/**
 * Seeds the Firestore database with sample product categories and products.
 * This function is idempotent and will not create duplicate data if run multiple times.
 * @param {Firestore} db - The Firestore database instance.
 */
export async function seedDatabase(db: Firestore) {
  if (!db) {
    throw new Error('Firestore instance is not available.');
  }

  const batch = writeBatch(db);
  const productsCollectionRef = collection(db, 'products');

  // Seed Categories
  categories.forEach(category => {
    const categoryDocRef = doc(db, 'product_categories', category.id);
    batch.set(categoryDocRef, category, { merge: true });
  });

  // Seed Products
  products.forEach(product => {
    const slug = product.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    
    // Create a doc ref with an auto-generated ID
    const productDocRef = doc(productsCollectionRef); 

    const productData = {
      id: productDocRef.id,
      slug: slug,
      name: product.name,
      categoryId: product.categoryId,
      description: product.description || `High-quality ${product.name}.`,
      imageUrls: [`https://picsum.photos/seed/${slug}/600/400`],
      mainImageIndex: 0,
      status: 'Published',
      featured: product.featured || false,
      pricing: product.pricing || { baseCost: 0, tax: 7.5, addons: [], tiers: [] }
    };
    
    batch.set(productDocRef, productData);
  });

  // Commit the batch
  await batch.commit();
}
