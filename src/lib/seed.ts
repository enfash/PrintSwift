
import { Firestore, collection, writeBatch, getDocs, query } from 'firebase/firestore';

// Main categories
const categories = [
    { id: "marketing-prints", name: "Marketing Prints" },
    { id: "large-format", name: "Large Format" },
    { id: "stickers-labels", name: "Stickers & Labels" },
    { id: "packaging", name: "Packaging" },
    { id: "apparel", name: "Apparel" },
    { id: "promotional-items", name: "Promotional Items" },
    { id: "event-personal", name: "Event & Personal" },
    { id: "design-services", name: "Design Services" },
    { id: "fast-print-collection", name: "Fast-Print Collection" },
    { id: "china-import-products", name: "China Import Products" },
];

const products = [
    // Marketing Prints
    { name: "Standard Business Cards", categoryId: "marketing-prints", featured: true },
    { name: "Premium Business Cards", categoryId: "marketing-prints" },
    { name: "Square Business Cards", categoryId: "marketing-prints" },
    { name: "Kraft Business Cards", categoryId: "marketing-prints" },
    { name: "Foil Business Cards", categoryId: "marketing-prints" },
    { name: "Single-sided Flyers", categoryId: "marketing-prints" },
    { name: "Double-sided Flyers", categoryId: "marketing-prints" },
    { name: "Bi-fold Brochures", categoryId: "marketing-prints" },
    { name: "Tri-fold Brochures", categoryId: "marketing-prints" },
    { name: "A3 Poster", categoryId: "marketing-prints" },
    { name: "A2 Poster", categoryId: "marketing-prints" },
    { name: "A1 Poster", categoryId: "marketing-prints" },
    { name: "A0 Poster", categoryId: "marketing-prints" },
    { name: "Letterheads", categoryId: "marketing-prints" },
    { name: "Compliment Slips", categoryId: "marketing-prints" },
    { name: "Envelopes (Branded)", categoryId: "marketing-prints" },
    { name: "Presentation Folders", categoryId: "marketing-prints" },
    { name: "Notepads", categoryId: "marketing-prints" },
    { name: "NCR/Invoice Books", categoryId: "marketing-prints" },
    { name: "Delivery Note Pads", categoryId: "marketing-prints" },
    { name: "Gift Vouchers", categoryId: "marketing-prints" },
    { name: "Loyalty Cards", categoryId: "marketing-prints" },
    { name: "Desk Calendars", categoryId: "marketing-prints" },
    { name: "Wall Calendars", categoryId: "marketing-prints" },
    { name: "Branded Notebooks", categoryId: "marketing-prints" },

    // Large Format
    { name: "Roll-Up Banner", categoryId: "large-format", featured: true },
    { name: "X-Stand Banner", categoryId: "large-format" },
    { name: "PVC Flex Banner", categoryId: "large-format" },
    { name: "Backdrop Banner", categoryId: "large-format" },
    { name: "Event Stage Backdrop", categoryId: "large-format" },
    { name: "Window Graphics", categoryId: "large-format" },
    { name: "One-Way Vision", categoryId: "large-format" },
    { name: "Wall Mural", categoryId: "large-format" },
    { name: "Corex Signboard", categoryId: "large-format" },
    { name: "Alupanel Signboard", categoryId: "large-format" },
    { name: "Directional Sign", categoryId: "large-format" },
    { name: "A-Board / A-Frame", categoryId: "large-format" },
    { name: "Backlit Sign Prints", categoryId: "large-format" },

    // Stickers & Labels
    { name: "Paper Stickers", categoryId: "stickers-labels" },
    { name: "Vinyl Stickers", categoryId: "stickers-labels" },
    { name: "Waterproof Stickers", categoryId: "stickers-labels" },
    { name: "Transparent Stickers", categoryId: "stickers-labels" },
    { name: "Die-Cut Stickers", categoryId: "stickers-labels" },
    { name: "Hologram Stickers", categoryId: "stickers-labels" },
    { name: "Tamper Evident Stickers", categoryId: "stickers-labels" },
    { name: "Product Labels", categoryId: "stickers-labels" },
    { name: "Bottle Labels", categoryId: "stickers-labels" },
    { name: "Roll Labels", categoryId: "stickers-labels" },
    { name: "Clothing Labels (Woven)", categoryId: "stickers-labels" },
    { name: "Satin Labels", categoryId: "stickers-labels" },
    { name: "Heat Transfer Clothing Labels", categoryId: "stickers-labels" },
    { name: "Wash Care Labels", categoryId: "stickers-labels" },

    // Packaging
    { name: "Greaseproof Paper", categoryId: "packaging" },
    { name: "Burger Wrap", categoryId: "packaging" },
    { name: "Shawarma Wrap", categoryId: "packaging" },
    { name: "Pizza Box", categoryId: "packaging", featured: true },
    { name: "French Fry Box", categoryId: "packaging" },
    { name: "Ice Cream Cup", categoryId: "packaging" },
    { name: "Salad Bowl", categoryId: "packaging" },
    { name: "Paper Trays", categoryId: "packaging" },
    { name: "Cup Sleeves", categoryId: "packaging" },
    { name: "Branded Nylon Bag (LDPE/HDPE)", categoryId: "packaging" },
    { name: "Paper Bag (Flat)", categoryId: "packaging" },
    { name: "Paper Bag (Rope Handle)", categoryId: "packaging" },
    { name: "Product Box (Cosmetics)", categoryId: "packaging" },
    { name: "Product Box (Electronics)", categoryId: "packaging" },
    { name: "Rigid Box", categoryId: "packaging" },
    { name: "Packaging Sleeves", categoryId: "packaging" },
    { name: "Hang Tags", categoryId: "packaging" },
    { name: "Insert Cards", categoryId: "packaging" },
    { name: "Thank You Cards", categoryId: "packaging" },

    // Apparel
    { name: "T-Shirts (DTG)", categoryId: "apparel" },
    { name: "Screen-Print T-Shirts", categoryId: "apparel", featured: true },
    { name: "Hoodie", categoryId: "apparel" },
    { name: "Polo Shirt", categoryId: "apparel" },
    { name: "Cap / Face Cap", categoryId: "apparel" },
    { name: "Aprons", categoryId: "apparel" },
    { name: "Workwear Uniform", categoryId: "apparel" },
    { name: "Safety Vest", categoryId: "apparel" },
    { name: "Tote Bag", categoryId: "apparel" },
    { name: "Canvas Bag", categoryId: "apparel" },

    // Promotional Items
    { name: "Pens", categoryId: "promotional-items" },
    { name: "Mugs", categoryId: "promotional-items" },
    { name: "Water Bottles", categoryId: "promotional-items" },
    { name: "Keyholders", categoryId: "promotional-items" },
    { name: "Mousepads", categoryId: "promotional-items" },
    { name: "Wristbands", categoryId: "promotional-items" },
    { name: "Notebooks", categoryId: "promotional-items" },
    { name: "ID Cards & Holders", categoryId: "promotional-items" },
    { name: "Lanyards", categoryId: "promotional-items" },
    { name: "Power Banks", categoryId: "promotional-items" },
    { name: "Diaries / Planners", categoryId: "promotional-items" },

    // Event & Personal
    { name: "Wedding Invitation Cards", categoryId: "event-personal" },
    { name: "Birthday Invitations", categoryId: "event-personal" },
    { name: "Wedding Program Booklet", categoryId: "event-personal" },
    { name: "Event Program Brochure", categoryId: "event-personal" },
    { name: "Custom Jotters", categoryId: "event-personal" },
    { name: "Photo Book", categoryId: "event-personal" },
    { name: "Stickers for Events", categoryId: "event-personal" },
    { name: "Party Backdrops", categoryId: "event-personal" },

    // Design Services
    { name: "Logo Design", categoryId: "design-services" },
    { name: "Brand Identity Design", categoryId: "design-services" },
    { name: "Flyer Design", categoryId: "design-services" },
    { name: "Poster Design", categoryId: "design-services" },
    { name: "Business Card Design", categoryId: "design-services" },
    { name: "Packaging Design", categoryId: "design-services" },
    { name: "Social Media Design Pack", categoryId: "design-services" },

    // Fast-Print Collection
    { name: "Same-Day Flyers", categoryId: "fast-print-collection" },
    { name: "Same-Day Posters", categoryId: "fast-print-collection" },
    { name: "Same-Day Business Cards", categoryId: "fast-print-collection" },
    { name: "Same-Day Roll-Up Banner", categoryId: "fast-print-collection" },
    { name: "Same-Day Stickers", categoryId: "fast-print-collection" },
    { name: "Same-Day T-Shirts", categoryId: "fast-print-collection" },

    // China Import Products
    { name: "Woven Labels", categoryId: "china-import-products" },
    { name: "Rubber Keychains", categoryId: "china-import-products" },
    { name: "Metal Keychains", categoryId: "china-import-products" },
    { name: "PVC Cards", categoryId: "china-import-products" },
    { name: "Premium Gift Boxes", categoryId: "china-import-products" },
    { name: "Custom USB Flash Drives", categoryId: "china-import-products" },
    { name: "Custom Branded Pens", categoryId: "china-import-products" },
    { name: "Corporate Gift Sets", categoryId: "china-import-products" },
];

export async function seedDatabase(db: Firestore) {
    const categoriesCollection = collection(db, 'product_categories');
    const productsCollection = collection(db, 'products');
    const batch = writeBatch(db);

    // Check if categories are already seeded
    const categoriesSnapshot = await getDocs(query(categoriesCollection));
    if (categoriesSnapshot.empty) {
        console.log('Seeding categories...');
        categories.forEach(category => {
            const docRef = collection(db, 'product_categories').doc(category.id);
            batch.set(docRef, { name: category.name, description: `Explore our ${category.name}.` });
        });
    } else {
        console.log('Categories already seeded.');
    }
    
    // Check if products are already seeded
    const productsSnapshot = await getDocs(query(productsCollection));
    if (productsSnapshot.empty) {
        console.log('Seeding products...');
        products.forEach((product, index) => {
            const docRef = collection(db, 'products').doc();
            batch.set(docRef, {
                name: product.name,
                categoryId: product.categoryId,
                description: `High-quality ${product.name}.`,
                price: Math.floor(Math.random() * (200 - 20 + 1) + 20) * 1000,
                featured: product.featured || false,
                imageUrl: `https://picsum.photos/seed/${product.name.replace(/\s+/g, '-')}/600/400`,
            });
        });
    } else {
        console.log('Products already seeded.');
    }

    // Commit the batch
    await batch.commit();
    console.log('Database seeding process completed.');
}
