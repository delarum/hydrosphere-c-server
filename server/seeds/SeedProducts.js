

require('dotenv').config();
const mongoose = require('mongoose');
const RecycledProduct = require('../models/RecycledProduct');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:5173';

const products = [
  // ── FASHION ────────────────────────────────────────────────────────────────
  {
    name: 'Ocean Drift Tee',
    description: 'Soft, breathable t-shirt crafted from 6 recovered ocean plastic bottles. Feels like cotton, saves the sea.',
    price: 34.99,
    image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&q=80',
    category: 'fashion',
    impact: { plasticRemoved: 0.15, co2Prevented: 2.1, waterSaved: 2700, itemsRecycled: 6 },
    stock: 85,
    rating: 5,
    reviews: 142,
    featured: true,
    badge: 'Bestseller',
  },
  {
    name: 'ReWave Hoodie',
    description: 'Heavyweight fleece hoodie made from 20 reclaimed plastic bottles. Warm, durable, and guilt-free.',
    price: 74.99,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&q=80',
    category: 'fashion',
    impact: { plasticRemoved: 0.5, co2Prevented: 5.8, waterSaved: 7200, itemsRecycled: 20 },
    stock: 40,
    rating: 5,
    reviews: 87,
    featured: true,
    badge: 'New',
  },
  {
    name: 'Coastline Cap',
    description: 'Structured 6-panel cap with moisture-wicking band, woven from reclaimed coastal plastics.',
    price: 24.99,
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&q=80',
    category: 'fashion',
    impact: { plasticRemoved: 0.08, co2Prevented: 0.9, waterSaved: 1100, itemsRecycled: 3 },
    stock: 120,
    rating: 4,
    reviews: 56,
    featured: false,
    badge: '',
  },

  // ── HOME ───────────────────────────────────────────────────────────────────
  {
    name: 'Tidal Throw Pillow',
    description: 'Plush decorative pillow with ocean-inspired print. Cover made from recycled PET fabric, fill from recovered foam.',
    price: 29.99,
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80',
    category: 'home',
    impact: { plasticRemoved: 0.22, co2Prevented: 1.6, waterSaved: 3200, itemsRecycled: 8 },
    stock: 60,
    rating: 5,
    reviews: 93,
    featured: true,
    badge: '',
  },
  {
    name: 'EcoWeave Rug 120×80cm',
    description: 'Handwoven flat-weave rug using yarn spun from sorted ocean plastic fibres. Durable, washable, beautiful.',
    price: 119.99,
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80',
    category: 'home',
    impact: { plasticRemoved: 2.4, co2Prevented: 12.0, waterSaved: 18000, itemsRecycled: 80 },
    stock: 25,
    rating: 5,
    reviews: 38,
    featured: true,
    badge: 'Limited',
  },
  {
    name: 'Shoreline Planter Set',
    description: 'Set of 3 nesting planters moulded from 100% post-consumer coastal HDPE. UV-resistant for indoor and outdoor use.',
    price: 44.99,
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&q=80',
    category: 'home',
    impact: { plasticRemoved: 0.9, co2Prevented: 3.2, waterSaved: 5500, itemsRecycled: 18 },
    stock: 50,
    rating: 4,
    reviews: 44,
    featured: false,
    badge: '',
  },

  // ── ACCESSORIES ────────────────────────────────────────────────────────────
  {
    name: 'Drift Tote Bag',
    description: 'Spacious market tote woven from reclaimed fishing nets and plastic ropes. Holds up to 15kg.',
    price: 19.99,
    image: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=600&q=80',
    category: 'accessories',
    impact: { plasticRemoved: 0.3, co2Prevented: 1.8, waterSaved: 2400, itemsRecycled: 5 },
    stock: 200,
    rating: 5,
    reviews: 201,
    featured: true,
    badge: 'Bestseller',
  },
  {
    name: 'Ocean Cord Bracelet',
    description: 'Handcrafted bracelet made from reclaimed fishing line. Each piece is unique — tied by artisans in Mombasa.',
    price: 12.99,
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80',
    category: 'accessories',
    impact: { plasticRemoved: 0.02, co2Prevented: 0.1, waterSaved: 150, itemsRecycled: 1 },
    stock: 300,
    rating: 5,
    reviews: 315,
    featured: false,
    badge: 'New',
  },

  // ── TECH ───────────────────────────────────────────────────────────────────
  {
    name: 'ReShell Phone Case',
    description: 'Slim, drop-tested phone case moulded from compressed ocean plastic pellets. Available for major models.',
    price: 22.99,
    image: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=600&q=80',
    category: 'tech',
    impact: { plasticRemoved: 0.06, co2Prevented: 0.4, waterSaved: 600, itemsRecycled: 2 },
    stock: 180,
    rating: 4,
    reviews: 128,
    featured: true,
    badge: '',
  },
  {
    name: 'Tideline Laptop Sleeve 15"',
    description: 'Padded laptop sleeve with water-resistant lining, made from recycled ocean PET bottles. Fits up to 15.6".',
    price: 39.99,
    image: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=600&q=80',
    category: 'tech',
    impact: { plasticRemoved: 0.35, co2Prevented: 2.4, waterSaved: 3800, itemsRecycled: 12 },
    stock: 70,
    rating: 5,
    reviews: 66,
    featured: false,
    badge: '',
  },

  // ── ART ────────────────────────────────────────────────────────────────────
  {
    name: 'Seascape Wall Panel',
    description: 'Framed wall art panel constructed from flattened, colour-sorted ocean plastics arranged by Kenyan artisans.',
    price: 89.99,
    image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=600&q=80',
    category: 'art',
    impact: { plasticRemoved: 1.2, co2Prevented: 4.5, waterSaved: 9000, itemsRecycled: 35 },
    stock: 15,
    rating: 5,
    reviews: 27,
    featured: true,
    badge: 'Limited',
  },
  {
    name: 'Bottle Cap Mosaic Kit',
    description: 'DIY mosaic kit with 500 hand-sorted bottle caps and a canvas board. Create your own ocean art at home.',
    price: 27.99,
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&q=80',
    category: 'art',
    impact: { plasticRemoved: 0.5, co2Prevented: 1.2, waterSaved: 2000, itemsRecycled: 500 },
    stock: 90,
    rating: 4,
    reviews: 73,
    featured: false,
    badge: 'New',
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB:', MONGO_URI);

    const existing = await RecycledProduct.countDocuments();
    if (existing > 0) {
      console.log(`⚠️  ${existing} products already exist.`);
      const answer = process.argv.includes('--force')
        ? 'yes'
        : await new Promise(resolve => {
            process.stdout.write('Delete existing and re-seed? (yes/no): ');
            process.stdin.once('data', d => resolve(d.toString().trim().toLowerCase()));
          });

      if (answer !== 'yes') {
        console.log('Aborted.');
        process.exit(0);
      }
      await RecycledProduct.deleteMany({});
      console.log('🗑️  Cleared existing products.');
    }

    const inserted = await RecycledProduct.insertMany(products);
    console.log(`\n🌊 Seeded ${inserted.length} products:\n`);
    inserted.forEach(p => console.log(`  [${p.category.padEnd(11)}] ${p.name}  — $${p.price}`));
    console.log('\n✅ Done. Your shop is ready.');
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
